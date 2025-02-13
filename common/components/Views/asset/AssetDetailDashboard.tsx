import { InterestRate } from '@/common/components/Views/asset/InterestRate';
import { MAX_BPS } from '@/common/consts';
import { formatNumberBalance, nFormatter } from '@/utils';
import { Card, Col, Progress, Row, Typography } from 'antd';
import BigNumber from 'bignumber.js';
import React from 'react';
import { isMobile } from 'react-device-detect';

interface Props {
  asset: PoolAsset;
}

export const AssetDetailDashboard: React.FunctionComponent<Props> = ({ asset }) => {
  return (
    <div className={'flex flex-col space-y-5'}>
      <Card bordered={false} className={'bg-[#F9F9FB] border border-[#EFF1F5] card-shadow2 p-2 sm:p-3 rounded-[28px]'}>
        <Row gutter={[24, 24]}>
          <Col className={'space-y-4'} xs={24} xl={24}>
            <Card bordered={false} className={' py-4 px-3 sm:px-6 border border-[#EFF1F5] rounded-[24px]'}>
              <Typography className={'text-lg font-semibold'}>Supply info</Typography>
              <Row gutter={[16, 16]} className={'mt-4'}>
                <Col xs={24} sm={16} xl={18}>
                  <div className={'border border-[#EFF1F5] rounded-[12px] p-5'}>
                    <div className={'flex flex-row gap-5 sm:gap-8 items-start sm:items-center'}>
                      <Progress
                        width={isMobile ? 120 : 120}
                        strokeColor={{
                          '17.64%': '#2458F6',
                          '49.44%': '#011BFF',
                          '85.3%': '#8345E6',
                        }}
                        strokeWidth={9}
                        type="circle"
                        percent={BigNumber((asset.poolSupply / asset.supplyCap) * 100).toNumber()}
                        format={(percent) => (
                          <span className={'font-semibold text-xl text-gradient'}>
                            {formatNumberBalance(percent, 2)}%{' '}
                          </span>
                        )}
                      />
                      <div className={'flex flex-1 flex-col sm:flex-row items-start gap-4 sm:gap-8 w-full h-full'}>
                        <div className={'flex-1'}>
                          <div className={'text-sm flex items-center gap-2 sm:text-base text-[#7A88B4] font-medium'}>
                            <span>Total supplied</span>
                          </div>
                          <div className={'mt-4'}>
                            <span className={'text-[#1A2A3B] text-base sm:text-2xl font-semibold'}>
                              {nFormatter(
                                Number(
                                  BigNumber(asset.poolSupply)
                                    .div(BigNumber(10).pow(asset.token.decimals))
                                    .toNumber()
                                    .toFixed(2),
                                ),
                              )}
                            </span>{' '}
                            <span className={'text-[#7A88B4] font-medium'}>
                              /{' '}
                              {nFormatter(
                                BigNumber(asset.supplyCap).div(BigNumber(10).pow(asset.token.decimals)).toNumber(),
                              )}
                            </span>
                          </div>
                          <div className={'text-[#7A88B4] mt-1 font-medium'}>
                            $
                            {nFormatter(
                              Number(
                                BigNumber(
                                  (asset.poolSupply * asset.token.price) / 10 ** asset.token.decimals < 0.01
                                    ? 0
                                    : asset.poolSupply * asset.token.price,
                                )
                                  .div(BigNumber(10).pow(asset.token.decimals))
                                  .toNumber()
                                  .toFixed(2),
                              ),
                            )}{' '}
                            of $
                            {nFormatter(
                              Number(
                                BigNumber(asset.supplyCap * asset.token.price)
                                  .div(BigNumber(10).pow(asset.token.decimals))
                                  .toNumber()
                                  .toFixed(2),
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={8} xl={6}>
                  <div className={'border border-[#EFF1F5] h-full p-5 rounded-[12px]'}>
                    <div className={'mt-8 flex flex-row gap-5 sm:gap-8 items-start sm:items-center'}>
                      <div className={'flex flex-1 flex-col sm:flex-row items-start gap-4 sm:gap-8 w-full h-full'}>
                        <div className={'flex-1 flex flex-col'}>
                          <div className={'text-sm sm:text-base text-[#7A88B4] font-medium'}>APR</div>
                          <div className={'text-[#1A2A3B] text-base sm:text-xl font-bold mt-2'}>
                            {formatNumberBalance(asset.supplyApy + asset.stakingApr + asset.incentiveSupplyApy, 2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
            <div className={'px-3 sm:px-6 pb-4'}>
              <Typography className={'text-lg font-semibold mt-5 '}>Collateral usage</Typography>
              <Row className={'mt-3'} gutter={[18, 18]}>
                <Col xs={24} xl={8}>
                  <div className={'border-[#EFF1F5] border bg-[#fff] rounded-[12px] p-5'}>
                    <Typography className={'text-[#7A88B4] text-base font-medium'}>Max LTV</Typography>
                    <Typography className={'text-xl font-bold mt-3'}>
                      {formatNumberBalance((asset.normaBps / MAX_BPS) * 100, 2)}%
                    </Typography>
                  </div>
                </Col>
                <Col xs={24} xl={8}>
                  <div className={'border-[#EFF1F5] border bg-[#fff] rounded-[12px] p-5'}>
                    <Typography className={'text-[#7A88B4] text-base font-medium'}>Liquidation threshold</Typography>
                    <Typography className={'text-xl font-bold mt-3'}>
                      {formatNumberBalance(asset.liquidationThresholdBps / 100)}%
                    </Typography>
                  </div>
                </Col>
                <Col xs={24} xl={8}>
                  <div className={'border-[#EFF1F5] border bg-[#fff] rounded-[12px] p-5'}>
                    <Typography className={'text-[#7A88B4] font-medium text-base'}>Liquidation penalty</Typography>
                    <Typography className={'text-xl font-bold mt-3'}>
                      {formatNumberBalance((asset.liquidationFeeBps / MAX_BPS) * 100, 2)}%
                    </Typography>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Card>
      <Card bordered={false} className={'bg-[#F9F9FB] border border-[#EFF1F5] card-shadow2 p-2 sm:p-3 rounded-[28px]'}>
        <Row gutter={[24, 24]}>
          <Col className={'space-y-4'} xs={24} xl={24}>
            <Card bordered={false} className={' py-4 px-3 sm:px-6 border border-[#EFF1F5] rounded-[24px]'}>
              <Typography className={'text-lg font-semibold'}>Borrow info</Typography>
              <Row gutter={[16, 16]} className={'mt-4'}>
                <Col xs={24} sm={24} xl={24}>
                  <div className={'border border-[#EFF1F5] rounded-[12px] p-5'}>
                    <div className={'flex flex-row gap-5 sm:gap-8 items-start sm:items-center'}>
                      <Progress
                        width={isMobile ? 120 : 120}
                        strokeColor={{
                          '17.64%': '#2458F6',
                          '49.44%': '#011BFF',
                          '85.3%': '#8345E6',
                        }}
                        strokeWidth={7}
                        type="circle"
                        percent={BigNumber((asset.totalDebt / asset.borrowCap) * 100).toNumber()}
                        format={(percent) => (
                          <span className={'text-xl text-gradient font-semibold'}>
                            {formatNumberBalance(percent, 2)}%{' '}
                          </span>
                        )}
                      />
                      <div className={'flex flex-1 flex-col sm:flex-row items-start gap-4 sm:gap-8'}>
                        <div className={'flex-1'}>
                          <div className={'text-sm flex items-center gap-2 sm:text-base text-[#7A88B4] font-medium'}>
                            <span>Total borrowed</span>
                          </div>
                          <div className={'mt-2'}>
                            <span className={'text-[#1A2A3B] text-base sm:text-2xl font-semibold'}>
                              {nFormatter(
                                Number(
                                  BigNumber(asset.totalDebt)
                                    .div(BigNumber(10).pow(asset.token.decimals))
                                    .toNumber()
                                    .toFixed(2),
                                ),
                              )}
                            </span>{' '}
                            <span className={'text-[#7A88B4] font-medium '}>
                              /{' '}
                              {nFormatter(
                                Number(
                                  BigNumber(asset.borrowCap)
                                    .div(BigNumber(10).pow(asset.token.decimals))
                                    .toNumber()
                                    .toFixed(2),
                                ),
                              )}
                            </span>
                          </div>
                          <div className={'text-[#7A88B4] font-medium mt-1'}>
                            $
                            {nFormatter(
                              Number(
                                BigNumber(asset.totalDebt * asset.token.price)
                                  .div(BigNumber(10).pow(asset.token.decimals))
                                  .toNumber()
                                  .toFixed(2),
                              ),
                            )}{' '}
                            of $
                            {nFormatter(
                              Number(
                                BigNumber(asset.borrowCap * asset.token.price)
                                  .div(BigNumber(10).pow(asset.token.decimals))
                                  .toNumber()
                                  .toFixed(2),
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row className={'mt-3'} gutter={[18, 18]}>
                <Col xs={24} xl={8}>
                  <div className={'border-[#EFF1F5] border bg-[#fff] rounded-[12px] p-5'}>
                    <div className={'flex-1'}>
                      <div className={'text-base text-[#7A88B4] font-medium'}>Borrow cap</div>
                      <div className={'text-[#1A2A3B] text-base sm:text-xl mt-2 font-bold'}>
                        {nFormatter(BigNumber(asset.borrowCap).div(BigNumber(10).pow(asset.token.decimals)).toNumber())}
                      </div>
                      <div className={'text-[#7A88B4] font-medium'}>
                        $
                        {nFormatter(
                          Number(
                            BigNumber(asset.borrowCap * asset.token.price)
                              .div(BigNumber(10).pow(asset.token.decimals))
                              .toNumber()
                              .toFixed(2),
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} xl={8}>
                  <div className={'border-[#EFF1F5] border bg-[#fff] h-full rounded-[12px] p-5'}>
                    <Typography className={'text-[#7A88B4] text-base font-medium'}>APR</Typography>
                    <Typography className={'text-xl font-bold mt-3'}>
                      {formatNumberBalance(asset.borrowApy + -asset.incentiveBorrowApy, 2)}%
                    </Typography>
                  </div>
                </Col>
                <Col xs={24} xl={8}>
                  <div className={'border-[#EFF1F5] border bg-[#fff] h-full rounded-[12px] p-5'}>
                    <Typography className={'text-[#7A88B4] font-medium text-base'}>Flash Loan Fee</Typography>
                    <Typography className={'text-xl font-bold mt-3'}>
                      {(asset.borrowFeeBps / MAX_BPS) * 100}%
                    </Typography>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>
      {asset.emodeId && (
        <Card
          bordered={false}
          className={'bg-[#F9F9FB] border border-[#EFF1F5] card-shadow2 p-2 sm:p-3 rounded-[28px]'}
        >
          <Row gutter={[24, 24]}>
            <Col className={'space-y-4'} xs={24} xl={24}>
              <Card bordered={false} className={' py-4 px-3 sm:px-6 border border-[#EFF1F5] rounded-[24px]'}>
                <Typography className={'text-lg font-semibold'}>E-Mode info</Typography>
                <Row className={'mt-3'} gutter={[18, 18]}>
                  <Col xs={24} xl={8}>
                    <div className={'border-[#EFF1F5] border bg-[#fff] rounded-[12px] p-5'}>
                      <Typography className={'text-[#7A88B4] text-base font-medium'}>Max LTV</Typography>
                      <Typography className={'text-xl font-bold mt-3'}>
                        {formatNumberBalance(formatNumberBalance((asset.emodeBps / MAX_BPS) * 100, 2))}%
                      </Typography>
                    </div>
                  </Col>
                  <Col xs={24} xl={8}>
                    <div className={'border-[#EFF1F5] border bg-[#fff] rounded-[12px] p-5'}>
                      <Typography className={'text-[#7A88B4] text-base font-medium'}>Liquidation threshold</Typography>
                      <Typography className={'text-xl font-bold mt-3'}>
                        {(asset.emodeLiquidationThresholdBps / MAX_BPS) * 100}%
                      </Typography>
                    </div>
                  </Col>
                  <Col xs={24} xl={8}>
                    <div className={'border-[#EFF1F5] border bg-[#fff] rounded-[12px] p-5'}>
                      <Typography className={'text-[#7A88B4] font-medium text-base'}>Liquidation penalty</Typography>
                      <Typography className={'text-xl font-bold mt-3'}>
                        {formatNumberBalance((asset.liquidationFeeBps / MAX_BPS) * 100, 2)}%
                      </Typography>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Card>
      )}
      <Row>
        <Col span={24}>
          <InterestRate asset={asset} />
        </Col>
      </Row>
    </div>
  );
};
