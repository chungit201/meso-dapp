import React, { useEffect, useMemo, useState } from 'react'
import InputCurrency from '@/common/components/InputCurrentcy'
import { Button, Slider } from 'antd'
import { formatNumberBalance, nFormatter, roundDown } from '@/utils'
import { calculatePositionLoop, generatePayloadLoop, Strategy } from '@/utils/stategies'
import { useAssets } from '@/common/hooks/assets/useAssets'
import useUser from '@/common/hooks/useUser'
import { CalculatorLoopingPosition } from '@/common/components/Views/strategies/CalculatorLoopingPosition'
import useTransactionCallback from '@/common/hooks/assets/useTransactionCallback'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import useBalanceToken from '@/common/hooks/useBalanceToken'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { MAX_BPS } from '@/common/consts'
import { LoopMode } from '@/common/hooks/strategies/ModalLoop'

interface Props {
  pair: Strategy
}

export const DepositLoop: React.FunctionComponent<Props> = ({ pair }) => {
  const [error, setError] = useState<string>('')
  const [amountDeposit, setAmountDeposit] = React.useState(0)
  const [leverage, setLeverage] = React.useState(1.1)
  const [loading, setLoading] = useState(false)
  const { assetDeposits, assetDebts, refetch: refetchPosition } = useAssets()
  const { userEMode } = useUser()
  const transactionCallback = useTransactionCallback()
  const { getBalanceCoin } = useBalanceToken()
  const { account } = useWallet()

  useEffect(() => {
    setError('')
  }, [amountDeposit])

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

  const { data: balanceAsset = 0, refetch } = useQuery({
    queryKey: ['getBalanceAssetsSupply', pair, account],
    queryFn: async () => {
      const balance = await getBalanceCoin(pair.asset0.token, account?.address as string)
      return BigNumber(balance)
        .div(BigNumber(10).pow(pair.asset0.token.decimals ?? 8))
        .toNumber()
    },
    enabled: !!pair && !!account,
    refetchIntervalInBackground: true,
    refetchOnReconnect: 'always',
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  })

  const onchangeSlider = (value: any) => {
    const leverage = Number((Number(maxLeverage) * value) / 100)
    setLeverage(Number(leverage).toFixed(2) as any)
  }

  const calculator = useMemo(() => {
    return calculatePositionLoop(
      amountDeposit,
      pair.asset0,
      assetDeposits,
      assetDebts,
      userEMode,
      Number(leverage),
      LoopMode.DEPOSIT,
    )
  }, [assetDebts, assetDeposits, amountDeposit, pair, userEMode, leverage])

  const handleLoop = async () => {
    try {
      if (amountDeposit === 0) {
        setError('The amount must be above zero')
        return
      }
      if (userEMode && userEMode !== pair.asset1.emodeId) {
        setError('You are only allowed to loop assets belonging to the selected category on Emode.')
        return
      }
      setLoading(true)
      transactionCallback({
        payload: generatePayloadLoop(pair, amountDeposit, leverage),
        onSuccess(hash: string) {
          console.log('hash', hash)
          refetch()
          refetchPosition()
          setAmountDeposit(0)
          setLeverage(1.1)
        },
        setLoading,
      })
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <>
      <InputCurrency
        disableSelectAssets
        max={balanceAsset}
        label={'Max'}
        placeholder={'0.00'}
        inputAmount={amountDeposit > 0 ? amountDeposit.toString() : ''}
        onInputChange={(value) => setAmountDeposit(value)}
        asset={pair.asset0}
        balance={balanceAsset}
        keepApt={pair.asset0.token.symbol === 'APT'}
        showSlider={false}
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
                ${nFormatter((amountDeposit ?? 0) * pair.asset0.token.price * leverage)}
              </span>
            </div>
          </div>
        </div>
      </div>
      <CalculatorLoopingPosition calculator={calculator} amountDeposit={amountDeposit} pair={pair} />
      {error && <p className={'text-red-500 mt-3 text-center'}>{error}</p>}

      <Button
        disabled={loading}
        loading={loading}
        onClick={handleLoop}
        className={'bg-[#7F56D9] rounded-full w-full mt-6 text-[#fff] font-semibold h-12'}
      >
        Loop now
      </Button>
    </>
  )
}
