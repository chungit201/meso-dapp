import React from 'react'
import { Card, Col, Row, Typography } from 'antd'
import { formatNumberBalance, nFormatter } from '@/utils'
import BigNumber from 'bignumber.js'
import { useQuery } from '@tanstack/react-query'
import { MESO_ADDRESS } from '@/common/consts'
import useContract from '@/common/hooks/useContract'
import Link from 'next/link'
import { ShareIcon } from '@/common/components/Icons'

interface Props {
  asset: PoolAsset
}

export const AssetInfo: React.FunctionComponent<Props> = ({ asset }) => {
  const { view } = useContract()
  const { data: price = 0 } = useQuery({
    queryKey: ['GetPrice', asset],
    queryFn: async () => {
      const res: any = await view({
        function: `${MESO_ADDRESS}::oracle::get_price`,
        typeArguments: [],
        functionArguments: [asset.token.address],
      })
      return BigNumber(Number(res[0])).div(BigNumber(10).pow(8)).toNumber()
    },
    enabled: !!asset,
  })

  return (
    <Card bordered={false} className={'p-4 flex rounded-[12px] card-shadow2'}>
      <div className={'flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-20'}>
        <div className={'flex gap-2 items-center'}>
          <div className={'flex items-center gap-4'}>
            <img
              className={'w-[40px] sm:w-[80px] h-auto'}
              src={`https://image.meso.finance/${asset?.token?.symbol.toLowerCase()}.png`}
              alt={''}
            />
            <div>
              <Typography className={'text-[#30374F] text-xl sm:text-2xl font-bold'}>{asset?.token?.symbol}</Typography>
              <Link
                target={'_blank'}
                className={'flex items-center text-xs sm:text-sm gap-2 text-[#5D6B98]'}
                href={`https://aptoscan.com/${asset.token.type === 'COIN' ? 'coin' : 'objects'}/${asset?.token?.address}`}
              >
                View on explorer
                <ShareIcon />
              </Link>
            </div>
          </div>
        </div>
        <Row
          gutter={[12, 12]}
          className={'border flex items-center flex-1 w-full border-[#ECF0FE] asset-info-box p-6 rounded-[12px]'}
        >
          <Col xs={12} xl={6}>
            <div className={'flex-1'}>
              <Typography className={'text-xs sm:text-sm mb-1 sm:mb-3 text-[#5D6B98] font-medium'}>
                Reserve size
              </Typography>
              <span className={'text-lg sm:text-xl font-bold'}>
                $
                {nFormatter(
                  BigNumber(
                    (asset?.poolSupply * asset.token.price) / 10 ** asset?.token.decimals < 0.01
                      ? 0
                      : asset?.poolSupply * asset?.token.price,
                  )
                    .div(BigNumber(10).pow(asset.token.decimals))
                    .toNumber(),
                )}
              </span>
            </div>
          </Col>
          <Col xs={12} xl={6}>
            <div className={'flex-1'}>
              <Typography className={'text-xs sm:text-sm text-[#5D6B98] font-medium mb-1 sm:mb-3'}>
                Available liquidity
              </Typography>
              <span className={'text-lg sm:text-xl font-bold'}>
                $
                {nFormatter(
                  BigNumber(
                    (asset.totalReserves * asset.token.price) / 10 ** asset.token.decimals < 0.01
                      ? 0
                      : asset.totalReserves * asset.token.price,
                  )
                    .div(BigNumber(10).pow(asset.token.decimals))
                    .toNumber(),
                )}
              </span>
            </div>
          </Col>
          <Col xs={12} xl={6}>
            <div className={'flex-1'}>
              <Typography className={'text-xs sm:text-sm mb-1 sm:mb-3 text-[#5D6B98] font-medium'}>
                Utilization rate
              </Typography>
              <span className={'text-lg sm:text-xl  font-bold'}>
                {asset.poolSupply > 0 ? Number((asset.totalDebt / asset.poolSupply) * 100).toFixed(2) : '0.00'}%
              </span>
            </div>
          </Col>
          <Col xs={12} xl={6}>
            <div className={'flex-1'}>
              <Typography className={'text-xs sm:text-sm mb-1 sm:mb-3 text-[#5D6B98] font-medium'}>
                Oracle price
              </Typography>
              <span className={'text-lg sm:text-xl  font-bold'}>${formatNumberBalance(price, 4)}</span>
            </div>
          </Col>
        </Row>
      </div>
    </Card>
  )
}
