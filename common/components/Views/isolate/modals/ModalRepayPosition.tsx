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
import { ISOLATE_ADDRESS, MAX_u64 } from '@/common/consts'
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets'
import { formatNumberBalance, getRiskFactorColor } from '@/utils'

interface Props {
  isModalOpen: boolean
  handleClose: () => void
  collateral: PoolAsset
  isolatePool: IsolatePools
}

export const ModalRepayPosition: React.FunctionComponent<Props> = ({
  handleClose,
  isModalOpen,
  collateral,
  isolatePool,
}) => {
  const [amount, setAmount] = React.useState(0)
  const { account } = useWallet()
  const { getBalanceCoin } = useBalanceToken()
  const { refetchUserPosition, getRiskFactor, assetsAmounts, assetsDebts, calculatorPosition } = useIsolatePools()
  const { view, run } = useContract()

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
      ManageAssetMode.Repay,
      assetsAmounts,
      assetsDebts,
      isolatePool,
    )
  }, [assetsAmounts, assetsDebts, amount, collateral])

  const { data: totalRepay = 0, refetch: refetchBorrowAmount } = useQuery({
    queryKey: ['TotalRepay', position, collateral],
    queryFn: async () => {
      const res: any = await view({
        function: `${ISOLATE_ADDRESS}::lending_pool::debt_amounts`,
        typeArguments: [],
        functionArguments: [position],
      })
      const data = res[0].data
      const val = data.find((x: any) => x.key.inner === collateral.poolAddress)
      if (!val) return 0
      return BigNumber(Number(val.value)).div(BigNumber(10).pow(collateral.token.decimals)).toNumber()
    },
    enabled: !!position && !!collateral,
    refetchIntervalInBackground: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  })

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

  const isMax = useMemo(() => {
    return amount === totalRepay
  }, [totalRepay, amount])

  const repay = async () => {
    if (collateral.token.type === CoinType.COIN) {
      return await run({
        function: `${ISOLATE_ADDRESS}::isolated::repay_coin`,
        typeArguments: [collateral.token.address],
        functionArguments: [
          collateral.poolAddress,
          position,
          isMax ? MAX_u64 : BigNumber(amount).times(BigNumber(10).pow(collateral.token.decimals)).toString(),
        ],
      })
    } else {
      return await run({
        function: `${ISOLATE_ADDRESS}::isolated::repay`,
        typeArguments: [],
        functionArguments: [
          collateral.token.address,
          position,
          isMax ? MAX_u64 : BigNumber(amount).times(BigNumber(10).pow(collateral.token.decimals)).toString(),
        ],
      })
    }
  }

  const { isPending, mutate: handleRepay } = useMutation({
    mutationFn: async () => repay(),
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
          <Typography className={'text-[#191D21] flex gap-1 text-lg'}>Repay</Typography>
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
          max={balanceAsset < totalRepay ? balanceAsset : totalRepay}
          maxDecimals={collateral.token.decimals}
          placeholder={'0.00'}
          inputAmount={Number(amount) > 0 ? amount.toString() : ''}
          onInputChange={handleChange}
          asset={collateral}
          balance={totalRepay}
          keepApt={collateral.token.symbol === 'APT' && balanceAsset < totalRepay}
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
          onClick={() => handleRepay()}
          loading={isPending}
          disabled={isPending || amount === 0}
          className={'bg-[#5C80FF] rounded-full text-[#fff] w-full h-11 mt-3 font-semibold'}
        >
          Repay
        </Button>
      </div>
    </Modal>
  )
}
