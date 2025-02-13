import useContract from '@/common/hooks/useContract'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { getAssetInfo, getAssetInfoByPoolAddress } from '@/utils/assets'
import BigNumber from 'bignumber.js'
import { useContext, useMemo } from 'react'
import { AssetsContext } from '@/common/context'
import { MESO_ADDRESS } from '@/common/consts'
import useUser from '@/common/hooks/useUser'
import { isAddress } from '@/utils'
import { useRouter } from 'next/router'

export const useAssets = () => {
  const { account } = useWallet()
  const { view } = useContract()
  const {
    allAssetsData,
    refetchAllAssetData,
    isLoading: loadingData,
    isFetchingDataOnchain,
  } = useContext(AssetsContext)
  const { userEMode, isRefetchingUserEmode } = useUser()
  const router = useRouter()

  const walletAddress = useMemo(
    () =>
      router.query.view_address && isAddress(router.query.view_address as string)
        ? router.query.view_address
        : account?.address,
    [account, router],
  )

  const {
    data: assetDeposits = [],
    isFetching: isFetchingDeposits,
    refetch: refetchAssetDeposits,
  } = useQuery({
    queryKey: ['assetAmounts', walletAddress, allAssetsData],
    queryFn: async () => {
      const res: any = await view({
        function: `${MESO_ADDRESS}::meso::asset_amounts`,
        typeArguments: [],
        functionArguments: [walletAddress],
      })

      const assetAmounts = res[0].data

      if (assetAmounts.length === 0) return []
      const depositData = []
      for (const item of assetAmounts) {
        const asset = getAssetInfo(allAssetsData, item.key)
        if (asset) {
          depositData.push({
            ...asset,
            amountDeposit: BigNumber(Number(item.value))
              .div(BigNumber(10).pow(asset?.token.decimals ?? 8))
              .toNumber(),
          })
        }
      }
      return depositData as PoolAsset[]
    },
    enabled: !!walletAddress && allAssetsData.length > 0 && !isFetchingDataOnchain,
  })

  const {
    data: assetDebts = [],
    isFetching: isFetchingDebt,
    refetch: refetchDebt,
  } = useQuery({
    queryKey: ['assetDebts', walletAddress, allAssetsData],
    queryFn: async () => {
      const res: any = await view({
        function: `${MESO_ADDRESS}::lending_pool::debt_amounts`,
        typeArguments: [],
        functionArguments: [walletAddress],
      })

      const debtAmounts = res[0].data
      if (debtAmounts.length === 0 && !isFetchingDebt) return []
      const debtData = []
      if (debtAmounts.length > 0 && allAssetsData.length > 0) {
        for (const item of debtAmounts) {
          const asset = getAssetInfoByPoolAddress(allAssetsData, item.key.inner)
          debtData.push({
            ...asset,
            debtAmount: BigNumber(Number(item.value))
              .div(BigNumber(10).pow(asset?.token.decimals ?? 8))
              .toNumber(),
          })
        }
      }
      return debtData as PoolAsset[]
    },
    enabled: !!walletAddress && allAssetsData.length > 0 && !isFetchingDataOnchain,
  })

  const assetsSupply = useMemo(() => {
    if (assetDeposits.length > 0 && !isFetchingDeposits) {
      return assetDeposits
    }
    if (!isFetchingDeposits && assetDeposits.length === 0) {
      return []
    }
    return assetDeposits
  }, [assetDeposits, isFetchingDeposits])

  const assetsBorrow = useMemo(() => {
    if (assetDebts.length > 0 && !isFetchingDebt) {
      return assetDebts
    }
    if (!isFetchingDebt && assetDebts.length === 0) {
      return []
    }
    return assetDebts
  }, [isFetchingDebt, assetDebts])

  const refetch = async () => {
    await refetchAllAssetData()
    await refetchDebt()
    await refetchAssetDeposits()
  }

  const isLoading = isFetchingDeposits || isFetchingDebt || loadingData || isRefetchingUserEmode

  const { data: riskFactor = 0 } = useQuery({
    queryKey: ['riskFactor', assetDebts, assetDeposits, userEMode, isLoading],
    queryFn: () => {
      let borrowingPower = 0
      let totalBorrow = 0
      if (assetDeposits.length == 0) {
        return 0
      }
      if (assetDebts.length == 0) {
        totalBorrow = 0
      }
      for (const item of assetDeposits) {
        borrowingPower +=
          item.amountDeposit *
          item?.token?.price *
          (userEMode && item.emodeId === userEMode
            ? item.emodeLiquidationThresholdBps / 10000
            : item.liquidationThresholdBps / 10000)
      }
      for (const item of assetDebts) {
        totalBorrow += item.debtAmount * Number(item?.token?.price)
      }

      return (totalBorrow / borrowingPower) * 100
    },
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  })

  const marketRiskFactor = useMemo(() => {
    let borrowingPower = 0
    let totalBorrow = 0
    if (allAssetsData.length == 0) {
      return 0
    }
    for (const item of allAssetsData) {
      borrowingPower +=
        (item.poolSupply / 10 ** item.token.decimals) *
        item?.token?.price *
        (userEMode ? item.emodeLiquidationThresholdBps / 10000 : item.liquidationThresholdBps / 10000)
    }
    for (const item of allAssetsData) {
      totalBorrow += (item.totalDebt / 10 ** item.token.decimals) * Number(item?.token?.price)
    }

    return (totalBorrow / borrowingPower) * 100
  }, [allAssetsData, userEMode])

  return {
    isFetchingDeposits,
    refetchAssetDeposits,
    refetchDebt,
    assetDeposits: assetsSupply,
    assetDebts: assetsBorrow,
    isFetching: isLoading,
    isFetchingDebt,
    refetch,
    riskFactor,
    marketRiskFactor,
  }
}
