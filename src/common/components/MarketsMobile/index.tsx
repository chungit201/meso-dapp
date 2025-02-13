import React from 'react'
import { Button, Col, Collapse, Row, Typography } from 'antd'
import { MAX_BPS } from '@/common/consts'
import useUser from '@/common/hooks/useUser'
import { formatNumberBalance, nFormatter } from '@/utils'
import { DownIcon } from '@/common/components/Icons'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/router'
import { PoolSupplyApr } from '@/common/components/Views/asset/PoolSupplyApr'
import { PoolBorrowApr } from '@/common/components/Views/asset/PoolBorrowApr'
import useToken from '@/common/hooks/useTokens'
const { Panel } = Collapse

interface Props {
  allAssetsData: PoolAsset[]
}

export const MarketsMobile: React.FunctionComponent<Props> = ({ allAssetsData }) => {
  const { userEMode } = useUser()
  const router = useRouter()
  const { getTokenBySymbol } = useToken()

  const onChange = (key: string | string[]) => {
    console.log(key)
  }
  return (
    <div className={'border border-[#DCDFEA] block md:hidden mt-4 rounded-[16px]'}>
      <Row className={'px-[12px] py-4  text-[#5D6B98] font-medium border-[#DCDFEA] border-b pr-[40px]'}>
        <Col span={8}>Asset Name</Col>
        <Col span={8} className={'text-center'}>
          LTV
        </Col>
        <Col className={'text-end'} span={8}>
          Supply APR
        </Col>
      </Row>
      <Collapse
        expandIconPosition={'right'}
        expandIcon={({ isActive }) => <DownIcon className={`${isActive ? 'rotate-180' : 'rotate-0'}`} />}
        className={'block md:hidden rounded-[16px]'}
        onChange={onChange}
      >
        {allAssetsData.map((item, index) => {
          return (
            <Panel
              className={' bg-transparent'}
              header={
                <Row className={'py-2'}>
                  <Col span={8}>
                    <div className={'flex items-center gap-2'}>
                      <img
                        className={'w-[28px] h-auto'}
                        src={`https://image.meso.finance/${item?.token.symbol.toLowerCase()}.png`}
                        alt={''}
                      />
                      <div>
                        <Typography className={'text-[#667085] text-sm font-medium'}>{item.token.symbol}</Typography>
                        <span className={'text-xs text-[#5D6B98]'}>
                          ${formatNumberBalance(getTokenBySymbol(item.token.symbol)?.price ?? 0, 2)}
                        </span>
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div>
                      <div className={'text-sm text-center text-[#1D2939] font-medium'}>
                        {(item.normaBps / MAX_BPS) * 100}%
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className={'flex justify-end items-center gap-2'}>
                      <PoolSupplyApr asset={item} />
                    </div>
                  </Col>
                </Row>
              }
              key={index}
            >
              <div className={'flex flex-col gap-4'}>
                <div className={'flex items-center justify-between'}>
                  <div className={'text-[#5D6B98] font-medium'}>E-Mode LTV</div>
                  <div className={'text-end'}>
                    <div className={'text-[#30374F] font-medium'}>{(item.emodeBps / MAX_BPS) * 100}%</div>
                  </div>
                </div>
                <div className={'flex items-center justify-between'}>
                  <div className={'text-[#5D6B98] font-medium'}>Borrow APR</div>
                  <div className={'flex justify-end items-center gap-2'}>
                    <PoolBorrowApr asset={item} />
                  </div>
                </div>

                <div className={'flex items-center justify-between'}>
                  <div className={'text-[#5D6B98] font-medium'}>Utilization</div>
                  <div className={'text-end'}>
                    <div className={'text-[#30374F] font-medium'}>
                      {formatNumberBalance((item.totalDebt / item.poolSupply) * 100, 2)}%
                    </div>
                  </div>
                </div>
                <div className={'flex items-center justify-between'}>
                  <div className={'text-[#5D6B98] font-medium'}>Liquidation Threshold</div>
                  <div className={'text-end'}>
                    <div className={'text-[#30374F] font-medium'}>
                      {formatNumberBalance((item.liquidationThresholdBps / MAX_BPS) * 100, 2)}%
                    </div>
                  </div>
                </div>
                <div className={'flex items-center justify-between'}>
                  <div className={'text-[#5D6B98] font-medium'}>E-Mode Liquidation Threshold</div>
                  <div className={'text-end'}>
                    <div className={'text-[#30374F] font-medium'}>
                      {formatNumberBalance((item.emodeLiquidationThresholdBps / MAX_BPS) * 100, 2)}%
                    </div>
                  </div>
                </div>
                <div className={'flex items-center justify-between'}>
                  <div className={'text-[#5D6B98] font-medium'}>Market Size</div>
                  <div className={'text-end'}>
                    <div className={'text-[#30374F] font-medium'}>
                      {nFormatter(
                        Number(
                          BigNumber(item.poolSupply).div(BigNumber(10).pow(item.token.decimals)).toNumber().toFixed(2),
                        ),
                      )}
                    </div>
                    <div className={'text-[#5D6B98]'}>
                      $
                      {nFormatter(
                        BigNumber(item.poolSupply).div(BigNumber(10).pow(item.token.decimals)).toNumber() *
                          item.token.price,
                      )}
                    </div>
                  </div>
                </div>
                <div className={'flex items-center justify-between'}>
                  <div className={'text-[#5D6B98] font-medium'}>Total Borrowed</div>
                  <div className={'text-end'}>
                    <div className={'text-[#30374F] font-medium'}>
                      {nFormatter(BigNumber(item.totalDebt).div(BigNumber(10).pow(item.token.decimals)).toNumber())}{' '}
                      {item.token.symbol}
                    </div>
                    <div className={'text-[#5D6B98]'}>
                      $
                      {nFormatter(
                        BigNumber(item.totalDebt).div(BigNumber(10).pow(item.token.decimals)).toNumber() *
                          item.token.price,
                      )}
                    </div>
                  </div>
                </div>
                <div className={'flex items-center justify-between'}>
                  <div className={'text-[#5D6B98] font-medium'}>Wallet Balance</div>
                  <div className={'text-end'}>
                    <div className={'text-[#30374F] font-medium'}>
                      {nFormatter(item.walletBalance)} {item.token.symbol}
                    </div>
                    <div className={'text-[#5D6B98]'}>${nFormatter(item.walletBalance * item.token.price)}</div>
                  </div>
                </div>
                <Button
                  onClick={() => router.push(`/asset/${item.poolAddress}`)}
                  className={'border-[#7F56D9] text-[#7F56D9] rounded-full h-9'}
                >
                  See details
                </Button>
              </div>
            </Panel>
          )
        })}
      </Collapse>
    </div>
  )
}
