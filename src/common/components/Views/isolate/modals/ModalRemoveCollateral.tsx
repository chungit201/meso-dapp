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
import { formatNumberBalance, getRiskFactorColor } from '@/utils'

interface Props {
  isModalOpen: boolean
  handleClose: () => void
  collateral: PoolAsset
  isolatePool: IsolatePools
}

export const ModalRemoveCollateral: React.FunctionComponent<Props> = ({
  handleClose,
  isModalOpen,
  collateral,
  isolatePool,
}) => {
  const [amount, setAmount] = React.useState(0)
  const { view } = useContract()
  const { getRiskFactor, assetsAmounts, assetsDebts, calculatorPosition, refetchUserPosition } = useIsolatePools()
  const { run } = useContract()

  useEffect(() => {
    refetchUserPosition()
    setAmount(0)
  }, [isModalOpen])

  const position = useMemo(() => isolatePool.position, [isolatePool])

  const riskFactor = useMemo(() => {
    return getRiskFactor(assetsAmounts, assetsDebts, isolatePool)
  }, [assetsAmounts, assetsDebts, isolatePool])

  const calculator = useMemo(() => {
    return calculatorPosition(
      !isNaN(amount) ? amount * collateral.token.price : 0,
      collateral,
      ManageAssetMode.Withdraw,
      assetsAmounts,
      assetsDebts,
      isolatePool,
    )
  }, [assetsAmounts, assetsDebts, amount, collateral])

  const { data: totalWithdrawAvailable = 0, refetch: refetchWithdrawAmount } = useQuery({
    queryKey: ['WithdrawAvailable', collateral, position, isModalOpen],
    queryFn: async () => {
      if (!collateral) {
        return 0
      }
      const res: any = await view({
        function: `${ISOLATE_ADDRESS}::lending_pool::remaining_withdrawable_amount`,
        typeArguments: [],
        functionArguments: [position, collateral.poolAddress],
      })
      return BigNumber(Number(res[0])).div(BigNumber(10).pow(collateral.token.decimals)).toNumber()
    },
    enabled: !!position,
  })

  const withdraw = async () => {
    if (collateral.token.type === CoinType.COIN) {
      return await run({
        function: `${ISOLATE_ADDRESS}::isolated::withdraw_coin`,
        typeArguments: [collateral.token.address],
        functionArguments: [
          position,
          collateral.poolAddress,
          BigNumber(amount).times(BigNumber(10).pow(collateral.token.decimals)).toString(),
        ],
      })
    } else {
      return await run({
        function: `${ISOLATE_ADDRESS}::isolated::withdraw`,
        typeArguments: [],
        functionArguments: [
          position,
          collateral.poolAddress,
          BigNumber(amount).times(BigNumber(10).pow(collateral.token.decimals)).toString(),
        ],
      })
    }
  }

  const { isPending, mutate: remove } = useMutation({
    mutationFn: async () => withdraw(),
    onSuccess: (res: any) => {
      refetchWithdrawAmount()
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
          <Typography className={'text-[#191D21] flex gap-1 text-lg'}>Remove collateral</Typography>
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
          max={totalWithdrawAvailable}
          maxDecimals={collateral.token.decimals}
          placeholder={'0.00'}
          inputAmount={Number(amount) > 0 ? amount.toString() : ''}
          onInputChange={handleChange}
          asset={collateral}
          balance={totalWithdrawAvailable}
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
          onClick={() => remove()}
          disabled={isPending || amount === 0}
          className={'bg-[#5C80FF] rounded-full text-[#fff] w-full h-11 mt-8 font-semibold'}
        >
          Remove collateral
        </Button>
      </div>
    </Modal>
  )
}
