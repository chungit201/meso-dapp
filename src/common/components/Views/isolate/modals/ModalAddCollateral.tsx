import React, { useEffect, useMemo } from 'react'
import { Button, Modal, notification, Typography } from 'antd'
import InputCurrency from '@/common/components/InputCurrentcy'
import { useMutation, useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import useBalanceToken, { CoinType } from '@/common/hooks/useBalanceToken'
import { CloseIcon, LeftToRightIcon } from '@/common/components/Icons'
import { useIsolatePools } from '@/common/hooks/useIsolatePools'
import useContract from '@/common/hooks/useContract'
import { ISOLATE_ADDRESS } from '@/common/consts'
import { InputEntryFunctionData } from '@aptos-labs/ts-sdk'
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets'
import { formatNumberBalance, getRiskFactorColor } from '@/utils'

interface Props {
  isModalOpen: boolean
  handleClose: () => void
  collateral: PoolAsset
  isolatePool: IsolatePools
}

export const ModalAddCollateral: React.FunctionComponent<Props> = ({
  handleClose,
  isModalOpen,
  collateral,
  isolatePool,
}) => {
  const [amount, setAmount] = React.useState(0)
  const { account } = useWallet()
  const { getBalanceCoin } = useBalanceToken()
  const { refetchUserPosition, getRiskFactor, assetsAmounts, assetsDebts, calculatorPosition } = useIsolatePools()

  const { run } = useContract()
  const position = useMemo(() => isolatePool.position, [isolatePool])

  useEffect(() => {
    setAmount(0)
  }, [isModalOpen])

  const riskFactor = useMemo(() => {
    return getRiskFactor(assetsAmounts, assetsDebts, isolatePool)
  }, [assetsAmounts, assetsDebts, isolatePool])

  const calculator = useMemo(() => {
    return calculatorPosition(
      !isNaN(amount) ? amount * collateral.token.price : 0,
      collateral,
      ManageAssetMode.Supply,
      assetsAmounts,
      assetsDebts,
      isolatePool,
    )
  }, [assetsAmounts, assetsDebts, amount, collateral])

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

  const depositAndCreatePosition = async (asset: PoolAsset) => {
    if (position !== '') {
      const payloadDepositCoin = {
        function: `${ISOLATE_ADDRESS}::isolated::deposit_coin`,
        typeArguments: [asset.token.address],
        functionArguments: [
          position,
          asset.poolAddress,
          BigNumber(amount).times(BigNumber(10).pow(asset.token.decimals)).toString(),
        ],
      } as InputEntryFunctionData
      const payloadDepositFa = {
        function: `${ISOLATE_ADDRESS}::isolated::deposit`,
        typeArguments: [],
        functionArguments: [
          asset.token.address,
          asset.poolAddress,
          position,
          BigNumber(amount).times(BigNumber(10).pow(asset.token.decimals)).toString(),
        ],
      } as InputEntryFunctionData
      return run(asset.token.type === CoinType.COIN ? payloadDepositCoin : payloadDepositFa)
    } else {
      if (asset.token.type === CoinType.COIN) {
        return run({
          function: `${ISOLATE_ADDRESS}::isolated::deposit_coin_without_position`,
          typeArguments: [asset.token.address],
          functionArguments: [
            asset.poolAddress,
            BigNumber(amount).times(BigNumber(10).pow(asset.token.decimals)).toString(),
          ],
        })
      } else {
        return run({
          function: `${ISOLATE_ADDRESS}::isolated::deposit_without_position`,
          typeArguments: [],
          functionArguments: [
            asset.token.address,
            collateral.poolAddress,
            BigNumber(amount).times(BigNumber(10).pow(collateral.token.decimals)).toString(),
          ],
        })
      }
    }
  }

  const { isPending, mutate: add } = useMutation({
    mutationFn: async () => {
      return await depositAndCreatePosition(collateral)
    },
    onSuccess: (res: any) => {
      refetch()
      setAmount(0)
      setTimeout(async () => {
        await refetchUserPosition()
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
          <Typography className={'text-[#191D21] flex gap-1 text-lg'}>Add collateral</Typography>
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
        <div className={'flex justify-between mt-10'}>
          <div>Est. Risk Factor</div>
          <div className={'flex items-center gap-2'}>
            <div style={{ color: getRiskFactorColor(riskFactor) }} className={'flex items-center font-medium  gap-1'}>
              {formatNumberBalance(riskFactor, 2)}%
            </div>
            {amount > 0 && (
              <>
                <LeftToRightIcon />
                <div
                  style={{ color: getRiskFactorColor(calculator.riskFactor) }}
                  className={'flex items-center font-medium gap-1'}
                >
                  {formatNumberBalance(calculator.riskFactor, 2)}%
                </div>
              </>
            )}
          </div>
        </div>
        <Button
          loading={isPending}
          onClick={() => add()}
          disabled={isPending || amount === 0 || amount > balanceAsset}
          className={'bg-[#5C80FF] disabled:bg-[#ccc] rounded-full text-[#fff] w-full h-11 mt-8 font-semibold'}
        >
          Add collateral
        </Button>
      </div>
    </Modal>
  )
}
