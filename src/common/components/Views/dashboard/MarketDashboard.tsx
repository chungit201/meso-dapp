import React from 'react'
import { Card, Col, Row, Skeleton, Typography } from 'antd'
import { formatNumberBalance, nFormatter } from '@/utils'
import { UpIcon } from '@/common/components/Icons'
import { useQuery } from '@tanstack/react-query'
import { getMarketDashboard } from '@/common/services/assets'

type MarketInfo = {
  currentMarketSize: {
    percentage: number
    total: number
  }

  totalValueLocked: {
    percentage: number
    total: number
  }

  totalBorrowed: {
    percentage: number
    total: number
  }
  lendingOut: {
    percentage: number
    total: number
  }
}

export const MarketDashboard: React.FunctionComponent = () => {
  const { data: info = null, isFetching = true } = useQuery({
    queryKey: ['MarketDashboard'],
    queryFn: async () => {
      const { data } = await getMarketDashboard({ type: 'week' })
      return data as MarketInfo
    },
  })

  return (
    <>
      {isFetching && (
        <Row
          gutter={[
            { xs: 6, sm: 6, xl: 16 },
            { xs: 6, sm: 6, xl: 16 },
          ]}
        >
          <Col xs={24} sm={24} xl={6}>
            <Card bordered={false} className={'bg-[#FFFFFF]  h-[113px] border border-[#EFF1F5] p-5 rounded-[16px]'}>
              <div className={'flex flex-col gap-3'}>
                <Typography className={'text-[#101828] font-medium text-sm sm:text-base'}>
                  Current Market Size
                </Typography>
                <Skeleton.Button active className={'w-full h-[36px] '} />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} xl={6}>
            <Card bordered={false} className={'bg-[#FFFFFF] h-[113px] border border-[#EFF1F5] p-5 rounded-[16px]'}>
              <div className={'flex flex-col gap-3'}>
                <Typography className={'text-[#101828] font-medium text-sm sm:text-base'}>
                  Total Value Locked
                </Typography>
                <Skeleton.Button active className={'w-full h-[36px] '} />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} xl={6}>
            <Card bordered={false} className={'bg-[#FFFFFF] h-[113px] border border-[#EFF1F5] p-5 rounded-[16px]'}>
              <div className={'flex flex-col gap-3'}>
                <Typography className={'text-[#101828] font-medium text-sm sm:text-base'}>Total Borrowed</Typography>
                <Skeleton.Button active className={'w-full h-[36px] '} />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} xl={6}>
            <Card bordered={false} className={'bg-[#FFFFFF] h-[113px] border border-[#EFF1F5] p-5 rounded-[16px]'}>
              <div className={'flex flex-col gap-3'}>
                <Typography className={'text-[#101828] font-medium text-sm sm:text-base'}>Lend Out</Typography>
                <Skeleton.Button active className={'w-full h-[36px] '} />
              </div>
            </Card>
          </Col>
        </Row>
      )}
      {info && !isFetching && (
        <Row
          gutter={[
            { xs: 6, sm: 6, xl: 16 },
            { xs: 6, sm: 6, xl: 16 },
          ]}
        >
          <Col xs={24} sm={24} md={12} xl={6}>
            <Card bordered={false} className={'bg-[#FFFFFF] border border-[#EFF1F5] p-5 rounded-[16px]'}>
              <div className={'flex justify-between items-end'}>
                <div>
                  <Typography className={'text-[#101828] font-medium text-sm sm:text-base'}>
                    Current Market Size
                  </Typography>
                  <div className={'flex items-center  gap-3 mt-3'}>
                    <div className={'text-xl sm:text-3xl font-bold text-[#101828] '}>
                      <span className={'countdown'}>${nFormatter(info.currentMarketSize.total ?? 0)}</span>
                    </div>
                    {Number(info.currentMarketSize.percentage) > 0 && (
                      <div
                        className={`flex gap-1 bg-[#12b76a1a] px-2 py-1 rounded-full items-center  text-[#4A5578] font-medium`}
                      >
                        <UpIcon />
                        <span className={`text-[#12B76A]`}>
                          {formatNumberBalance(Number(info.currentMarketSize.percentage), 2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12} xl={6}>
            <Card bordered={false} className={'bg-[#FFFFFF] border border-[#EFF1F5] p-5 rounded-[16px]'}>
              <div className={'flex justify-between items-end'}>
                <div>
                  <Typography className={'text-[#101828] font-medium text-sm sm:text-base'}>
                    Total Value Locked
                  </Typography>
                  <div className={'flex items-center  gap-3 mt-3'}>
                    <div className={'text-xl sm:text-3xl font-bold text-[#101828] '}>
                      <span className={'countdown'}>${nFormatter(info.totalValueLocked.total ?? 0)}</span>
                    </div>
                    {Number(info.totalValueLocked.percentage) > 0 && (
                      <div
                        className={`flex gap-1 bg-[#12b76a1a] px-2 py-1 rounded-full items-center  text-[#4A5578] font-medium`}
                      >
                        <UpIcon />
                        <span className={`text-[#12B76A]`}>
                          {formatNumberBalance(Number(info.totalValueLocked.percentage), 2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12} xl={6}>
            <Card bordered={false} className={'bg-[#FFFFFF] border border-[#EFF1F5] p-5 rounded-[16px]'}>
              <div className={'flex justify-between items-end'}>
                <div>
                  <Typography className={'text-[#101828] font-medium text-sm sm:text-base'}>Total Borrowed</Typography>
                  <div className={'flex items-center  gap-3 mt-3'}>
                    <div className={'text-xl sm:text-3xl font-bold text-[#101828] '}>
                      <span className={'countdown'}>${nFormatter(info.totalBorrowed.total ?? 0)}</span>
                    </div>
                    {Number(info.totalBorrowed.percentage) > 0 && (
                      <div
                        className={`flex gap-1 bg-[#12b76a1a] px-2 py-1 rounded-full items-center  text-[#4A5578] font-medium`}
                      >
                        <UpIcon />
                        <span className={`text-[#12B76A]`}>
                          {formatNumberBalance(Number(info.totalBorrowed.percentage), 2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12} xl={6}>
            <Card bordered={false} className={'bg-[#FFFFFF] border border-[#EFF1F5] p-5 rounded-[16px]'}>
              <div className={'flex justify-between items-end'}>
                <div>
                  <Typography className={'text-[#101828] font-medium text-sm sm:text-base'}>Lend Out</Typography>
                  <div className={'flex items-center  gap-3 mt-3'}>
                    <div className={'text-xl sm:text-3xl font-bold text-[#101828] '}>
                      <span className={'countdown'}>{nFormatter(info.lendingOut.total ?? 0)}%</span>
                    </div>
                    {Number(info.lendingOut.percentage) > 0 && (
                      <div
                        className={`flex gap-1 bg-[#12b76a1a] px-2 py-1 rounded-full items-center  text-[#4A5578] font-medium`}
                      >
                        <UpIcon />
                        <span className={`text-[#12B76A]`}>
                          {formatNumberBalance(Number(info.lendingOut.percentage), 2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </>
  )
}
export default MarketDashboard
