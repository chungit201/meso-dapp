import React, { useEffect, useMemo } from 'react'
import { Button, Modal, notification, Typography } from 'antd'
import InputCurrency from '@/common/components/InputCurrentcy'
import { useMutation, useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { CloseIcon, LeftToRightIcon } from '@/common/components/Icons'
import { ISOLATE_ADDRESS } from '@/common/consts'
import useContract from '@/common/hooks/useContract'
import { useIsolatePools } from '@/common/hooks/useIsolatePools'
import { CoinType } from '@/common/hooks/useBalanceToken'
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets'
import { formatNumberBalance, getRiskFactorColor, roundDown } from '@/utils'

interface Props {
  isModalOpen: boolean
  handleClose: () => void
  asset: PoolAsset
  isolatePool: IsolatePools
}

export const ModalBorrowPosition: React.FunctionComponent<Props> = ({
  handleClose,
  isModalOpen,
  asset,
  isolatePool,
}) => {
  const [amount, setAmount] = React.useState(0)
  const { view, run } = useContract()
  const { refetchUserPosition, calculatorPosition, assetsAmounts, assetsDebts, getRiskFactor } = useIsolatePools()

  const position = useMemo(() => isolatePool.position, [isolatePool])

  useEffect(() => {
    refetchUserPosition()
    setAmount(0)
  }, [isModalOpen])

  const riskFactor = useMemo(() => {
    return getRiskFactor(assetsAmounts, assetsDebts, isolatePool)
  }, [assetsAmounts, assetsDebts, isolatePool])

  const calculator = useMemo(() => {
    return calculatorPosition(
      !isNaN(amount) ? amount * asset.token.price : 0,
      asset,
      ManageAssetMode.Borrow,
      assetsAmounts,
      assetsDebts,
      isolatePool,
    )
  }, [assetsAmounts, assetsDebts, amount, asset])

  const { data: totalReserves = 0 } = useQuery({
    queryKey: ['totalReserves', asset],
    queryFn: async () => {
      const data = await Promise.all([
        view({
          function: `${ISOLATE_ADDRESS}::lending_pool::pool_supply`,
          typeArguments: [],
          functionArguments: [asset.poolAddress],
        }),
        view({
          function: `${ISOLATE_ADDRESS}::lending_pool::total_pool_debt`,
          typeArguments: [],
          functionArguments: [asset.poolAddress],
        }),
      ])
      const totalSupply = BigNumber(Number(data[0][0])).div(BigNumber(10).pow(asset.token.decimals)).toNumber()
      const totalBorrow = BigNumber(Number(data[1][0])).div(BigNumber(10).pow(asset.token.decimals)).toNumber()
      const reserves = roundDown(totalSupply - totalBorrow, asset.token.decimals)
      return reserves > 0 ? reserves : 0
    },
    enabled: !!asset,
  })

  const { data: totalBorrowAvailable = 0, refetch: refetchBorrowAmount } = useQuery({
    queryKey: ['BorrowAssetAvailable', asset, isModalOpen, position],
    queryFn: async () => {
      const res: any = await view({
        function: `${ISOLATE_ADDRESS}::lending_pool::max_borrowable_amount`,
        typeArguments: [],
        functionArguments: [position, asset.poolAddress],
      })
      const maxBorrow = BigNumber(Number(res[0])).div(BigNumber(10).pow(asset.token.decimals)).toNumber()
      const totalBorrowAvailableInPool = BigNumber(asset.borrowCap - asset.totalDebt)
        .div(BigNumber(10).pow(asset.token.decimals))
        .toNumber()
      const borrowAvailable = maxBorrow > totalBorrowAvailableInPool ? totalBorrowAvailableInPool : maxBorrow
      return borrowAvailable < 0 ? 0 : Number(((borrowAvailable * 99.5) / 100).toFixed(asset.token.decimals))
    },
    enabled: !!asset && !!position,
    refetchInterval: 5000,
  })

  const borrow = async () => {
    if (asset.token.type === CoinType.COIN) {
      return await run({
        function: `${ISOLATE_ADDRESS}::isolated::borrow_coin`,
        typeArguments: [asset.token.address],
        functionArguments: [
          asset.poolAddress,
          position,
          BigNumber(amount).times(BigNumber(10).pow(asset.token.decimals)).toString(),
        ],
      })
    } else {
      return await run({
        function: `${ISOLATE_ADDRESS}::isolated::borrow`,
        typeArguments: [],
        functionArguments: [
          asset.token.address,
          asset.poolAddress,
          position,

          BigNumber(amount).times(BigNumber(10).pow(asset.token.decimals)).toString(),
        ],
      })
    }
  }

  const { isPending, mutate: hanldeBorrow } = useMutation({
    mutationFn: async () => borrow(),
    onSuccess: (res: any) => {
      refetchBorrowAmount()
      refetchUserPosition()
      setAmount(0)
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
          <Typography className={'text-[#191D21] flex gap-1 text-lg'}>Borrow</Typography>
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
          max={totalBorrowAvailable > totalReserves ? totalReserves : totalBorrowAvailable}
          maxDecimals={asset.token.decimals}
          placeholder={'0.00'}
          inputAmount={Number(amount) > 0 ? amount.toString() : ''}
          onInputChange={handleChange}
          asset={asset}
          balance={totalBorrowAvailable > totalReserves ? totalReserves : totalBorrowAvailable}
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
        <div className={'bg-[#F9FAFB] text-[#515D86] p-4 mt-6 rounded-[8px]'}>
          Disclaimer: Volatile collateral token carries a high chance of liquidation with higher LTV.
        </div>

        <Button
          loading={isPending}
          onClick={() => hanldeBorrow()}
          disabled={isPending || amount <= 0}
          className={'bg-[#5C80FF] rounded-full text-[#fff] w-full h-11 mt-3 font-semibold'}
        >
          Borrow
        </Button>
      </div>
    </Modal>
  )
}
