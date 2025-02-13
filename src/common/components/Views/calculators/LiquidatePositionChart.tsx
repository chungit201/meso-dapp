import React, { useMemo } from 'react'
import { Bar, CartesianGrid, ComposedChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card, Tooltip, Typography } from 'antd'
import { nFormatter } from '@/utils'
import { useSelector } from 'react-redux'
import { CircleInfo } from '@/common/components/Icons'

interface Props {
  supplyAssets: PoolAsset[]
  borrowAssets: PoolAsset[]
  userEMode: string
  tokens: Token[]
}

export const LiquidatePositionChart: React.FunctionComponent<Props> = ({
  supplyAssets,
  borrowAssets,
  userEMode,
  tokens,
}) => {
  const app = useSelector((state: any) => state.app)

  function formatYAxis(value: number) {
    return `$${nFormatter(value)}`
  }

  const data = useMemo(() => {
    let supplyValues = 0
    let borrowValues = 0

    for (const i of supplyAssets) {
      const tokenPrice = tokens.find((x) => x.address === i.token.address)?.priceChange ?? 0
      supplyValues += (i.amountChange ?? 0) * tokenPrice
    }
    for (const i of borrowAssets) {
      const tokenPrice = tokens.find((x) => x.address === i.token.address)?.priceChange ?? 0
      const price = tokenPrice ?? 0
      borrowValues += (i.amountChange ?? 0) * price
    }
    return [
      {
        name: '',
        uv: app.stepCalculator === 4 ? 1500 : supplyValues,
        pv: app.stepCalculator === 4 ? 600 : borrowValues,
        amt: 4,
      },
    ]
  }, [supplyAssets, borrowAssets, tokens, app])

  const liquidatePosition = useMemo(() => {
    let borrowingPower = 0
    if (app.stepCalculator === 4) {
      return 1270
    }
    if (supplyAssets.length == 0) {
      return 0
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
    return !isNaN(borrowingPower) ? borrowingPower : 0
  }, [supplyAssets, tokens, app.stepCalculator, userEMode])

  const totalBorrowVaule = useMemo(() => {
    let total = 0
    if (borrowAssets.length == 0) {
      return 0
    }
    for (const item of borrowAssets) {
      const tokenPrice = tokens.find((x) => x.address === item.token.address)?.priceChange ?? 0
      total += item.amountChange * tokenPrice
    }
    return total
  }, [borrowAssets, tokens])

  const CustomizedLabel = (props: any) => {
    const { x, y, value, height, width } = props
    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill={'#FFF'}
        style={{ fontWeight: 500 }}
        fontSize={13}
        textAnchor="middle"
      >
        {`$${nFormatter(value)}`}
      </text>
    )
  }

  return (
    <Card
      bordered={false}
      className={`bg-[#FFF] h-full border  border-[#EFF1F5] p-5 rounded-[16px] ${app.stepCalculator === 4 && 'z-[100]'}`}
    >
      <div className={'flex flex-col sm:flex-row gap-2 justify-between'}>
        <Typography className={'text-[#475467] flex items-center gap-1 font-medium '}>
          Liquidation Position
          <Tooltip
            trigger={['hover']}
            title={
              <div>
                <div className={'text-[##FFF] font-semibold'}>Liquidation Position</div>
                <div className={'mt-1'}>
                  This indicates the value at which a borrowing position will be considered undercollateralized and
                  subject to liquidation.
                </div>
              </div>
            }
          >
            <div className={'cursor-pointer'}>
              <CircleInfo className={'w-[15px] h-[16px]'} />
            </div>
          </Tooltip>
        </Typography>
        <div className={'flex flex-col gap-0'}>
          <div className={'flex items-center gap-2'}>
            <div className={'w-[8px] h-[8px] bg-[#0BA5EC] rounded-[2px]'}></div>
            <div className={'text-[#0BA5EC]'}>Collateral Value</div>
          </div>
          <div className={'flex items-center gap-2'}>
            <div className={'w-[8px] h-[8px] bg-[#FD853A] rounded-[2px]'}></div>
            <div className={'text-[#FD853A]'}>Borrowing Value</div>
          </div>
        </div>
      </div>
      <div className={'text-xl font-semibold mt-3 sm:mt-0'}>${nFormatter(liquidatePosition)}</div>

      <div className={'h-[210px]'}>
        <ResponsiveContainer className={'mt-6'} width="100%" height="100%">
          <ComposedChart
            barSize={90}
            width={500}
            height={200}
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -4,
              bottom: -10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" domain={[0, 100]} tickLine={false} axisLine={false} />
            <YAxis
              stroke={'#98A2B3'}
              orientation={'left'}
              type={'number'}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
            />
            <Tooltip />
            <Bar dataKey="uv" fill="#0BA5EC" label={<CustomizedLabel />} radius={[15, 15, 0, 0]} />
            <Bar dataKey="pv" fill="#FF7A45" label={<CustomizedLabel />} radius={[15, 15, 0, 0]} />
            {data[0].uv > 0 && data[0].pv > 0 && (
              <ReferenceLine
                y={liquidatePosition}
                label={{
                  position: 'insideBottomLeft',
                  value: `$${nFormatter(liquidatePosition)}`,
                  fill: `${liquidatePosition > totalBorrowVaule ? '#039855' : '#B42318'}`,
                  fontSize: 12,
                  fontWeight: 500,
                }}
                orientation="left"
                stroke={`${liquidatePosition > totalBorrowVaule ? '#039855' : '#B42318'}`}
                strokeDasharray="3 3"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
