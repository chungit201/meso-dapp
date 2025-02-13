import React, { useMemo, useState } from 'react'
import InputCurrency from '@/common/components/InputCurrentcy'
import { Button } from 'antd'
import { CalculatorLoopingPosition } from '@/common/components/Views/strategies/CalculatorLoopingPosition'
import { calculatePositionLoop, generatePayloadWithdraw, Strategy } from '@/utils/stategies'
import { useAssets } from '@/common/hooks/assets/useAssets'
import useUser from '@/common/hooks/useUser'
import useTransactionCallback from '@/common/hooks/assets/useTransactionCallback'
import { useStrategies } from '@/common/hooks/strategies/useStrategies'
import { LoopMode } from '@/common/hooks/strategies/ModalLoop'

interface Props {
  amountDeposited: number
  pair: Strategy
  userLeverage: number
  refetch: () => void
}

export const WithdrawLoop: React.FunctionComponent<Props> = ({ pair, amountDeposited, userLeverage, refetch }) => {
  const [loading, setLoading] = useState(false)
  const { assetDebts, assetDeposits, refetch: refetchPosition } = useAssets()
  const { userEMode } = useUser()
  const transactionCallback = useTransactionCallback()
  const { refetch: refetchStrategies } = useStrategies()

  const calculator = useMemo(() => {
    const newAssetsDeposits = assetDeposits.filter((x) => x.poolAddress !== pair.asset0.poolAddress)
    const newAssetsDebts = assetDebts.filter((x) => x.poolAddress !== pair.asset1.poolAddress)
    return calculatePositionLoop(0, pair.asset0, newAssetsDeposits, newAssetsDebts, userEMode, 0, LoopMode.WITHDRAW)
  }, [assetDebts, assetDeposits, amountDeposited, pair, userEMode, userLeverage])

  const withdraw = async () => {
    transactionCallback({
      payload: generatePayloadWithdraw(pair) as any,
      onSuccess(hash: string) {
        console.log('hash', hash)
        refetch()
        refetchStrategies()
        refetchPosition()
      },
      setLoading,
    })
  }

  return (
    <>
      <InputCurrency
        disableSelectAssets
        max={0}
        label={'Max'}
        placeholder={'0.00'}
        inputAmount={amountDeposited > 0 ? amountDeposited.toString() : ''}
        isDisabled={true}
        asset={pair.asset0}
        balance={amountDeposited}
        keepApt={pair.asset0.token.symbol === 'APT'}
        showSlider={false}
        hiddenMax={true}
      />

      <CalculatorLoopingPosition calculator={calculator} amountDeposit={amountDeposited} pair={pair} />
      <Button
        disabled={loading || amountDeposited === 0}
        loading={loading}
        onClick={withdraw}
        className={'bg-[#7F56D9] disabled:bg-[#ccc] rounded-full w-full mt-6 text-[#fff] font-semibold h-12'}
      >
        Withdraw Loop
      </Button>
    </>
  )
}
