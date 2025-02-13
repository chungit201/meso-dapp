import React, { useMemo } from 'react'
import { Card, Switch, Tooltip, Typography } from 'antd'
import { CircularProgressbar } from 'react-circular-progressbar'
import { EMODE_NAME } from '@/common/components/Views/dashboard/YourBorrows'
import { nFormatter } from '@/utils'
import { calculatorNetApr } from '@/utils/calculator'
import { useSelector } from 'react-redux'
import { CircleInfo } from '@/common/components/Icons'

interface Props {
  supplyAssets: PoolAsset[]
  borrowAssets: PoolAsset[]
  setShow: (value: boolean) => void
  userEMode: string
  tokens: Token[]
}

export const CalculatorPositionBox: React.FunctionComponent<Props> = ({
  supplyAssets,
  borrowAssets,
  setShow,
  userEMode,
  tokens,
}) => {
  const app = useSelector((state: any) => state.app)

  const emodeName = useMemo(() => {
    if (userEMode.includes('aptos')) {
      return EMODE_NAME.APT
    }
    if (userEMode.includes('USD')) {
      return EMODE_NAME.USD
    }
  }, [userEMode])

  const netAPR = useMemo(() => {
    const data = calculatorNetApr(supplyAssets, borrowAssets, tokens)
    return !isNaN(data) ? data : 0
  }, [borrowAssets, supplyAssets, tokens])

  const supplyApr = useMemo(() => {
    let totalSl = 0
    let totalApr = 0
    if (supplyAssets.length === 0) return 0
    for (const item of supplyAssets) {
      const tokenPrice = tokens.find((x) => x.address === item.token.address)?.priceChange ?? 0
      totalSl += item.amountChange * tokenPrice
      totalApr += (item.supplyApy + item.stakingApr + item.incentiveSupplyApy) * item.amountChange * tokenPrice
    }
    return totalSl > 0 ? totalApr / totalSl : 0
  }, [supplyAssets, tokens])

  const borrowApr = useMemo(() => {
    let totalBr = 0
    let totalApr = 0
    if (borrowAssets.length === 0) return 0
    for (const item of borrowAssets) {
      const tokenPrice = tokens.find((x) => x.address === item.token.address)?.priceChange ?? 0
      totalBr += item.amountChange * tokenPrice
      totalApr += (item.borrowApy + -item.incentiveBorrowApy) * (item.amountChange * tokenPrice)
    }
    return totalBr > 0 ? totalApr / totalBr : 0
  }, [borrowAssets, tokens])

  const riskFactor = useMemo(() => {
    let borrowingPower = 0
    let totalBorrow = 0
    if (app.stepCalculator === 4) {
      return 40
    }
    if (supplyAssets.length == 0) {
      return 0
    }
    if (borrowAssets.length == 0) {
      totalBorrow = 0
    }
    for (const item of supplyAssets) {
      const tokenPrice = tokens.find((x) => x.address === item.token.address)?.priceChange ?? 0
      borrowingPower +=
        item.amountChange *
        tokenPrice *
        (userEMode && item.emodeId === userEMode
          ? item.emodeLiquidationThresholdBps / 10000
          : item.liquidationThresholdBps / 10000)
    }
    for (const item of borrowAssets) {
      const tokenPrice = tokens.find((x) => x.address === item.token.address)?.priceChange ?? 0
      totalBorrow += item.amountChange * tokenPrice
    }
    if (borrowingPower === 0) return 0
    return !isNaN((totalBorrow / borrowingPower) * 100) ? (totalBorrow / borrowingPower) * 100 : 0
  }, [borrowAssets, supplyAssets, userEMode, tokens, app.stepCalculator])

  const riskFactorColor =
    riskFactor <= 90 ? '#7F56D9' : riskFactor >= 100 ? '#D92D20' : riskFactor >= 90 ? '#F79009' : ''

  return (
    <Card
      bordered={false}
      className={`bg-[#FFF] border border-[#EFF1F5] rounded-[16px] ${app.stepCalculator === 4 && 'z-[100]'}`}
    >
      <div className="p-5 relative ">
        <div className="flex justify-between">
          <Typography className="font-semibold text-base">Overview</Typography>
          <div className="flex items-center gap-2">
            <Typography className="text-[#5D6B98] font-medium">E - Mode</Typography>
            <div className="flex items-center gap-1">
              <Switch
                disabled={app.stepCalculator > 0}
                onClick={() => setShow(true)}
                checked={userEMode !== ''}
                className={` ${emodeName}`}
              />
              <span className="text-[#5D6B98] font-medium">
                {emodeName === EMODE_NAME.USD && 'Stable'}
                {emodeName === EMODE_NAME.APT && 'APT'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-center relative mt-5">
          <CircularProgressbar
            className="w-[220px]"
            backgroundPadding={10}
            counterClockwise={false}
            value={riskFactor}
            circleRatio={0.5}
            strokeWidth={18}
            styles={{
              root: {
                transform: 'rotate(0.75turn)',
              },
              path: { stroke: riskFactorColor, strokeLinecap: 'butt' },
              trail: { stroke: '#F2F4F7', strokeLinecap: 'butt' },
            }}
          />
          <div
            style={{ color: riskFactorColor }}
            className="text-center absolute right-[50%] translate-x-2/4 bottom-[110px]"
          >
            <div>Risk Factor</div>
            <div className="text-xl font-bold">{nFormatter(riskFactor)}%</div>
          </div>
        </div>
      </div>
      <div className="p-5 flex flex-col relative z-[10] md:flex-row gap-4 justify-between items-center -mt-[130px]">
        <div className="border border-[#E4E7EC] rounded-[16px] flex-1 w-full">
          <div className="p-3 flex items-center justify-between  border-b border-[#E4E7EC]">
            <div className="flex items-center gap-1">
              <div className="text-[#475467] font-medium">Status</div>
              <Tooltip
                trigger={['hover']}
                title={
                  <div>
                    <div className="text-[##FFF] font-semibold">Status</div>
                    <div className="mt-1">
                      {riskFactor < 90 &&
                        'Your position is currently safe. It also indicates that your collateral is well above the required level.'}
                      {riskFactor >= 90 &&
                        riskFactor < 100 &&
                        'At this stage, your position is getting closer to being liquidated. Consider to add more collateral or repay a portion of your loan to reduce risks.'}
                      {riskFactor >= 100 &&
                        'This shows that our position is triggered to be liquidated. The collateral is sold to repay the loan, as it no longer covers the borrowed amount.'}
                    </div>
                  </div>
                }
              >
                <div className="cursor-pointer">
                  <CircleInfo className="w-[15px] h-[16px]" />
                </div>
              </Tooltip>
            </div>
            {riskFactor <= 90 && (
              <span className="bg-[#F9F5FF] py-[4px] text-[#6941C6] px-3 font-medium rounded-[16px]">Safety</span>
            )}
            {riskFactor >= 90 && riskFactor < 100 && (
              <span className="bg-[#FFFAEB] py-[4px] text-[#B54708] px-3 font-medium rounded-[16px]">High risk</span>
            )}
            {riskFactor >= 100 && (
              <span className="bg-[#FEF3F2] py-[4px] text-[#B42318] px-3 font-medium rounded-[16px]">Liquidated</span>
            )}
          </div>
          <div className="p-3 flex items-center justify-between  border-b border-[#E4E7EC]">
            <div className="flex items-center gap-1">
              <div className="text-[#475467] font-medium">Net APR</div>
              <Tooltip
                trigger={['hover']}
                title={
                  <div>
                    It represents your actual profit or loss after accounting for both the interest earned and interest
                    paid.
                  </div>
                }
              >
                <div className="cursor-pointer">
                  <CircleInfo className="w-[15px] h-[16px]" />
                </div>
              </Tooltip>
            </div>
            <span className="text-[#9E77ED] font-medium">
              {riskFactor >= 100 ? `N/A` : `${nFormatter(app.stepCalculator === 4 ? 34 : netAPR ? netAPR : 0)}%`}
            </span>
          </div>
          <div className="p-3 flex items-center justify-between  border-b border-[#E4E7EC]">
            <div className="text-[#475467] font-medium">Supply APR</div>
            <span className="text-[#12B76A] font-medium">{nFormatter(app.stepCalculator === 4 ? 46 : supplyApr)}%</span>
          </div>
          <div className="p-3 flex items-center justify-between">
            <div className="text-[#475467] font-medium">Borrow APR</div>
            <span className="text-[#F04438] font-medium">{nFormatter(app.stepCalculator === 4 ? 12 : borrowApr)}%</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
