import React, { useEffect, useMemo } from 'react'
import { Button, Modal, notification, Typography } from 'antd'
import InputCurrency from '@/common/components/InputCurrentcy'
import { useMutation, useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import useBalanceToken, { CoinType } from '@/common/hooks/useBalanceToken'
import { CloseIcon } from '@/common/components/Icons'
import { InputEntryFunctionData } from '@aptos-labs/ts-sdk'
import { ISOLATE_ADDRESS } from '@/common/consts'
import { useIsolatePools } from '@/common/hooks/useIsolatePools'
import useContract from '@/common/hooks/useContract'

interface Props {
  isModalOpen: boolean
  handleClose: () => void
  collateral: PoolAsset
  isolatePool: IsolatePools
}

export const ModalSupplyPosition: React.FunctionComponent<Props> = ({
  handleClose,
  isModalOpen,
  collateral,
  isolatePool,
}) => {
  const [amount, setAmount] = React.useState(0)
  const { account } = useWallet()
  const { getBalanceCoin } = useBalanceToken()
  const { refetchUserPosition } = useIsolatePools()
  const { run } = useContract()

  const position = useMemo(() => isolatePool.position, [isolatePool])

  useEffect(() => {
    ;(async () => {
      await refetchUserPosition()
      setAmount(0)
    })()
  }, [isModalOpen])

  const { data: balanceAsset = 0, refetch } = useQuery({
    queryKey: ['getBalanceAssets', collateral, account],
    queryFn: async () => {
      const balance = await getBalanceCoin(collateral.token, account?.address as string)
      return BigNumber(balance)
        .div(BigNumber(10).pow(collateral.token.decimals ?? 8))
        .toNumber()
    },
    enabled: !!collateral && !!account,
    refetchIntervalInBackground: true,
    refetchOnReconnect: 'always',
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  })

  const deposit = () => {
    if (position !== '') {
      const payloadDepositCoin: InputEntryFunctionData = {
        function: `${ISOLATE_ADDRESS}::isolated::deposit_coin`,
        typeArguments: [collateral.token.address],
        functionArguments: [
          position,
          collateral.poolAddress,
          BigNumber(amount).times(BigNumber(10).pow(collateral.token.decimals)).toString(),
        ],
      }
      const payloadDepositFa: InputEntryFunctionData = {
        function: `${ISOLATE_ADDRESS}::isolated::deposit`,
        typeArguments: [],
        functionArguments: [
          collateral.token.address,
          position,
          collateral.poolAddress,
          BigNumber(amount).times(BigNumber(10).pow(collateral.token.decimals)).toString(),
        ],
      }
      return run(collateral.token.type === CoinType.COIN ? payloadDepositCoin : payloadDepositFa)
    } else {
      // return run({
      //   function: `${ISOLATE_ADDRESS}::isolated::${collateral.token.type === CoinType.COIN ? 'deposit_coin_without_position' : 'deposit_without_position'}`,
      //   typeArguments: [collateral.token.address],
      //   functionArguments: [
      //     collateral.poolAddress,
      //     BigNumber(amount).times(BigNumber(10).pow(collateral.token.decimals)).toString(),
      //   ],
      // })
      if (collateral.token.type === CoinType.COIN) {
        return run({
          function: `${ISOLATE_ADDRESS}::isolated::deposit_coin_without_position`,
          typeArguments: [collateral.token.address],
          functionArguments: [
            collateral.poolAddress,
            BigNumber(amount).times(BigNumber(10).pow(collateral.token.decimals)).toString(),
          ],
        })
      } else {
        return run({
          function: `${ISOLATE_ADDRESS}::isolated::deposit_without_position`,
          typeArguments: ['0x1::aptos_coin::AptosCoin'],
          functionArguments: [
            collateral.token.address,
            collateral.poolAddress,
            BigNumber(amount).times(BigNumber(10).pow(collateral.token.decimals)).toString(),
          ],
        })
      }
    }
  }

  const { isPending, mutate: supply } = useMutation({
    mutationFn: async () => {
      return await deposit()
    },
    onSuccess: (res: any) => {
      refetch()
      setAmount(0)
      setTimeout(() => {
        refetchUserPosition()
      }, 3000)
      handleClose()
      notification.success({ message: 'Transaction created.' })
    },
    onError: (error: any) => {
      notification.error({ message: error?.message || 'Something went wrong.' })
    },
  })

  const handleChange = (value: number) => {
    setAmount(value)
  }

  return (
    <Modal
      centered
      onCancel={() => {
        handleClose()
      }}
      open={isModalOpen}
      footer={false}
      closable={false}
      title={
        <div className={'flex items-center justify-between gap-3'}>
          <Typography className={'text-[#191D21] flex gap-1 text-lg'}>Supply</Typography>
          <div className={'flex items-center gap-2'}>
            <div onClick={handleClose} className={'cursor-pointer'}>
              <CloseIcon />
            </div>
          </div>
        </div>
      }
      width={483}
    >
      <div className={'p-6 pt-0'}>
        <InputCurrency
          label={'Max'}
          max={balanceAsset}
          maxDecimals={collateral.token.decimals}
          placeholder={'0.00'}
          inputAmount={Number(amount) > 0 ? amount.toString() : ''}
          onInputChange={handleChange}
          asset={collateral}
          balance={balanceAsset}
          keepApt={collateral.token.symbol === 'APT'}
          disableSelectAssets
        />

        <Button
          onClick={() => supply()}
          loading={isPending}
          disabled={isPending || amount === 0}
          className={'bg-[#5C80FF] rounded-full text-[#fff] w-full h-11 mt-8 font-semibold'}
        >
          Supply
        </Button>
      </div>
    </Modal>
  )
}
