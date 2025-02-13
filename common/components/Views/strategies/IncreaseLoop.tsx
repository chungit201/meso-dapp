import React, { useEffect, useMemo, useState } from 'react'
import InputCurrency from '@/common/components/InputCurrentcy'
import { Button, Slider } from 'antd'
import { formatNumberBalance, nFormatter, roundDown } from '@/utils'
import { CalculatorLoopingPosition } from '@/common/components/Views/strategies/CalculatorLoopingPosition'
import { calculatePositionLoop, generatePayloadIncrease, Strategy } from '@/utils/stategies'
import { useAssets } from '@/common/hooks/assets/useAssets'
import useUser from '@/common/hooks/useUser'
import useTransactionCallback from '@/common/hooks/assets/useTransactionCallback'
import { MAX_BPS } from '@/common/consts'
import { LoopMode } from '@/common/hooks/strategies/ModalLoop'

interface Props {
  pair: Strategy
  totalSupplied: number
  userLeverage: number
  amountDeposited: number
  refetch: () => void
}

export const IncreaseLoop: React.FunctionComponent<Props> = ({ pair, refetch, userLeverage, amountDeposited }) => {
  const [leverage, setLeverage] = React.useState(1.1)
  const [loading, setLoading] = useState(false)
  const { assetDebts, assetDeposits, refetch: refetchPosition } = useAssets()
  const { userEMode } = useUser()
  const transactionCallback = useTransactionCallback()

  const maxLeverage = useMemo(() => {
    let leverage = 0
    if (userEMode && userEMode === pair.asset1.emodeId) {
      const num = 1 / (1 - pair.asset1.emodeBps / MAX_BPS)
      leverage = roundDown(num - (num > 4 ? 2 : 0), 2)
    } else {
      const num = 1 / (1 - pair.asset1.normaBps / MAX_BPS)
      leverage = roundDown(num - (num > 4 ? 1 : 0), 2)
    }
    return leverage
  }, [pair, userEMode])

  useEffect(() => {
    setLeverage(userLeverage)
  }, [userLeverage])

  const calculator = useMemo(() => {
    return calculatePositionLoop(
      amountDeposited,
      pair.asset0,
      assetDeposits,
      assetDebts,
      userEMode,
      leverage,
      LoopMode.INCREASE,
    )
  }, [assetDebts, assetDeposits, amountDeposited, pair, userEMode, leverage])

  const increase = async () => {
    transactionCallback({
      payload: generatePayloadIncrease(pair, leverage),
      onSuccess(hash: string) {
        console.log('hash', hash)
        refetch()
        refetchPosition()
      },
      setLoading,
    })
  }

  const onchangeSlider = (value: any) => {
    const leverage = Number((Number(maxLeverage) * value) / 100)
    if (leverage >= userLeverage) {
      setLeverage(Number(leverage).toFixed(2) as any)
    }
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
      <div className={'mt-5'}>
        <Slider
          min={(1.1 / Number(maxLeverage)) * 100}
          railStyle={{ background: '#DCDFEA' }}
          tooltip={{
            formatter: (value) => `x${((Number(maxLeverage) * Number(value)) / 100).toFixed(2)}`,
          }}
          value={(Number(leverage) / Number(maxLeverage)) * 100}
          onChange={onchangeSlider}
        />
        <div>
          <div className={'flex justify-center items-center gap-3 mt-2'}>
            <div className={'text-[#475467]'}>
              Leverage: <span className={'text-[#7F56D9] font-semibold'}>x{formatNumberBalance(leverage, 2)}</span>
            </div>
            <div className={'w-[1px] h-[15px] bg-[#DCDFEA]'}></div>
            <div className={'text-[#475467]'}>
              Total value:{' '}
              <span className={'text-[#7F56D9] font-semibold'}>
                ${nFormatter((amountDeposited ?? 0) * pair.asset0.token.price * leverage)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <CalculatorLoopingPosition calculator={calculator} amountDeposit={amountDeposited} pair={pair} />
      <Button
        disabled={loading || amountDeposited === 0}
        loading={loading}
        onClick={increase}
        className={'bg-[#7F56D9] rounded-full disabled:bg-[#ccc] w-full mt-6 text-[#fff] font-semibold h-12'}
      >
        Increase Loop
      </Button>
    </>
  )
}
