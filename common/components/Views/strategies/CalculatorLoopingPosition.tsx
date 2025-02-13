import React from 'react'
import { Typography } from 'antd'
import { formatNumberBalance } from '@/utils'
import { LeftToRightIcon } from '@/common/components/Icons'
import { useAssets } from '@/common/hooks/assets/useAssets'
import { useDashboard } from '@/common/hooks/dashboard/useDashboard'
import { Strategy } from '@/utils/stategies'

interface Props {
  calculator: any
  amountDeposit: number
  pair: Strategy
}

export const CalculatorLoopingPosition: React.FunctionComponent<Props> = ({ calculator, amountDeposit, pair }) => {
  const { riskFactor } = useAssets()
  const { netApr } = useDashboard()

  const getRiskFactorColor = (riskFactor: number) => {
    return riskFactor < 80 ? '#7F56D9' : riskFactor > 90 ? '#F04438' : riskFactor >= 80 ? '#DC6803' : ''
  }

  return (
    <div className={'mt-8'}>
      <Typography className={'text-[#30374F] text-base font-semibold'}>Result</Typography>
      <div className={'flex flex-col gap-2 mt-4'}>
        <div className={'flex justify-between'}>
          <div className={'text-[#5D6B98]'}>Est. Risk Factor</div>
          <div className={'flex items-center gap-2'}>
            <div style={{ color: getRiskFactorColor(riskFactor) }} className={'flex items-center font-medium  gap-1'}>
              {formatNumberBalance(riskFactor, 2)}%
            </div>
            {amountDeposit > 0 && (
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
        <div className={'flex justify-between'}>
          <div className={'text-[#5D6B98]'}>Net APR</div>
          <div className={'flex items-center gap-2'}>
            <div className={'flex text-[#099250] items-center font-medium  gap-1'}>
              {formatNumberBalance(netApr, 2)}%
            </div>
            {amountDeposit > 0 && (
              <>
                <LeftToRightIcon />
                <div className={'flex items-center text-[#099250] font-medium gap-1'}>
                  {formatNumberBalance(calculator.netApr, 2)}%
                </div>
              </>
            )}
          </div>
        </div>
        <div className={'flex justify-between'}>
          <div className={'text-[#5D6B98]'}>Supply APR</div>
          <div className={'flex items-center gap-2'}>
            <div className={'flex items-center text-[#099250] font-medium  gap-1'}>
              {formatNumberBalance(pair.asset0.supplyApy + pair.asset0.stakingApr + pair.asset0.incentiveSupplyApy, 2)}%
            </div>
          </div>
        </div>
        <div className={'flex justify-between'}>
          <div className={'text-[#5D6B98]'}>Borrow APR</div>
          <div className={'flex items-center gap-2'}>
            <div className={'flex items-center font-medium text-[#FF4D4F] gap-1'}>
              {formatNumberBalance(pair.asset1.borrowApy - pair.asset1.incentiveBorrowApy, 2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
