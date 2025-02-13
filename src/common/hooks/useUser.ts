import { SignMessageResponse, useWallet } from '@aptos-labs/wallet-adapter-react'
import appActions from '@/modules/app/actions'
import { useDispatch, useSelector } from 'react-redux'
import { getData, removeData, setData } from '@/common/hooks/useLocalStoragre'
import { HexString } from 'aptos'
import { useMemo } from 'react'
import { getNonce, getUserInfo, login } from '@/common/services/points'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'
import { MESO_ADDRESS } from '@/common/consts'
import useContract from '@/common/hooks/useContract'
import { GateWalletName } from 'gate-plugin-wallet-adapter'
import { isAddress } from '@/utils'

export enum LOGIN_TYPE {
  TASK = 'TASK',
  PROMOTION = 'PROMOTION',
}

const useUser = () => {
  const { account, signMessage, wallet } = useWallet()
  const dispatch = useDispatch()
  const router = useRouter()
  const { ref } = router.query
  const { view } = useContract()
  const isLogin = useSelector((state: any) => state.app.isLogin)
  const accessToken = useMemo(() => getData('accessToken'), [account, isLogin])

  const walletAddress = useMemo(
    () =>
      router.query.view_address && isAddress(router.query.view_address as string)
        ? router.query.view_address
        : account?.address,
    [account, router],
  )

  const { data: userInfo = null, refetch: refetchUserInfo } = useQuery({
    queryKey: ['userInfo', walletAddress, accessToken, isLogin, router],
    queryFn: async () => {
      const { data } = await getUserInfo(walletAddress as string)
      return data
    },
    enabled: !!walletAddress,
  })

  const {
    data: userEMode = '',
    refetch: refetchUserEmode,
    isRefetching: isRefetchingUserEmode,
  } = useQuery({
    queryKey: ['EmodeID', walletAddress],
    queryFn: async () => {
      const resEmodeKeys = await view({
        function: `${MESO_ADDRESS}::meso::emode_keys`,
        typeArguments: [],
        functionArguments: [],
      })
      const modes = resEmodeKeys[0] as string[]
      const res: any = await view({
        function: `${MESO_ADDRESS}::lending_pool::user_mode_id`,
        typeArguments: [],
        functionArguments: [walletAddress],
      })
      const userModeId = res[0]
      if (userModeId === 'APT') {
        return modes[0]
      }
      if (userModeId === 'USD') {
        return modes[1]
      }
      return ''
    },
    enabled: !!walletAddress,
  })

  const getMessage = (type: LOGIN_TYPE) => {
    switch (type) {
      case LOGIN_TYPE.TASK:
        return 'Connect wallet by approving this request to perform Social task'
      case LOGIN_TYPE.PROMOTION:
        return "Meso requests you to connect your wallet. By signing, you'll enable the application of your promotion code."
      default:
        return 'Connect wallet by approving this request to continue the referral process'
    }
  }

  const handleLogin = async (type = null as any) => {
    const accessToken = getData('accessToken')
    if (!accessToken) {
      try {
        const { data } = await getNonce(walletAddress as any)
        const resMessage: any = (await signMessage({
          address: false,
          message: getMessage(type),
          nonce: data,
        })) as SignMessageResponse
        const signature = [GateWalletName].includes(wallet?.name as any)
          ? HexString.fromUint8Array(new Uint8Array(Object.values(resMessage.signature.data.data))).toString()
          : HexString.fromUint8Array(new Uint8Array(resMessage.signature.data.data)).toString()
        const resLogin = await login({
          address: walletAddress as string,
          message: resMessage.fullMessage,
          signature,
          publicKey: account?.publicKey as string,
          nonce: data.toString(),
          referralCode: ref ? (ref as string) : '',
        })
        dispatch(appActions.SET_IS_LOGIN(true))
        setData('accessToken', resLogin.data)
        return resLogin.data
      } catch (e: any) {
        console.log('e', e)
        await removeData('accessToken')
        // openNotificationError(e.name || e.message || e.response?.data?.message)
      }
    }
    return accessToken
  }

  return { handleLogin, userEMode, refetchUserEmode, isRefetchingUserEmode, userInfo, refetchUserInfo }
}

export default useUser
