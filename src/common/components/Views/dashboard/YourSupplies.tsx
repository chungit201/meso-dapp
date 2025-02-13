import React, { useEffect, useMemo, useState } from 'react'
import { Card, Col, Pagination, PaginationProps, Row, Typography } from 'antd'
import { useAssets } from '@/common/hooks/assets/useAssets'
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets'
import { formatNumberBalance, paginate } from '@/utils'
import { AssetRowItem } from '@/common/components/Views/asset/AssetRowItem'

interface Props {
  setAssetSelected: (value: PoolAsset) => void
  setMode: (value: ManageAssetMode | AssetRowType) => void
}

export enum AssetRowType {
  WITHDRAW = 'Withdraw',
  REPAY = 'Repay',
  SUPPLY = 'Supply',
  BORROW = 'Borrow',
}

export const YourSupplies: React.FunctionComponent<Props> = ({ setAssetSelected, setMode }) => {
  const { assetDeposits } = useAssets()
  const [totalSupply, setTotalSupply] = useState(0)
  const [totalSupplyApr, setTotalSupplyApr] = useState(0)
  const [current, setCurrent] = useState(1)

  useEffect(() => {
    let totalSl = 0
    let totalApr = 0
    for (const item of assetDeposits) {
      totalSl += item.amountDeposit * item?.token?.price
      totalApr += (item.supplyApy + item.stakingApr + item.incentiveSupplyApy) * item.amountDeposit * item?.token?.price
    }
    setTotalSupplyApr(totalApr / totalSl)
    setTotalSupply(totalSl)
  }, [assetDeposits])

  const assets = useMemo(() => paginate(assetDeposits, current, 10), [assetDeposits, current])

  const onChange: PaginationProps['onChange'] = (page) => {
    setCurrent(page)
  }

  return (
    <Col xs={24} xl={12}>
      <Card className={'h-full rounded-[8px] border border-[#DCDFEA]'}>
        <div className={'flex flex-col h-auto sm:h-full'}>
          <div className={' p-4 min-h-[100px] sm:min-h-[122px]'}>
            <Typography className={'text-[#090909] font-medium text-lg'}>Your Supplies</Typography>
            <Row gutter={[16, 16]} className={'mt-2'}>
              <Col xs={8} xl={8}>
                <Typography className={'text-[#5D6B98] text-xs sm:text-sm font-medium'}>Supplied</Typography>
                <div className={'text-[#404968] font-semibold text-sm sm:text-base mt-1'}>
                  ${formatNumberBalance(totalSupply, 2)}
                </div>
              </Col>
              <Col xs={7} xl={8}>
                <Typography className={'text-[#5D6B98] text-xs sm:text-sm font-medium'}>APR</Typography>
                <div className={'text-[#404968] font-semibold text-sm sm:text-base mt-1'}>
                  {formatNumberBalance(totalSupplyApr, 2)}%
                </div>
              </Col>
              <Col xs={9} xl={8}>
                <Typography className={'text-[#5D6B98] text-xs sm:text-sm font-medium'}>Collateral Value</Typography>
                <div className={'text-[#404968] font-semibold text-sm sm:text-base mt-1'}>
                  ${formatNumberBalance(totalSupply, 2)}
                </div>
              </Col>
            </Row>
          </div>
          <Row
            className={
              'justify-between items-start bg-[#F9F9FB] hidden sm:flex px-4 py-3 border-b border-t border-[#DCDFEA]'
            }
          >
            <Col span={6} className={'items-center text-[#62758A] font-medium'}>
              <Typography className={'px-4'}>Assets</Typography>
            </Col>
            <Col span={6} className={'min-w-[100px] text-end flex-1 text-[#62758A] font-medium'}>
              <Typography className={'px-4'}>Balance</Typography>
            </Col>
            <Col span={6} className={'min-w-[100px] flex-1 text-end text-[#62758A] font-medium'}>
              <Typography className={'px-4'}>APR</Typography>
            </Col>
            <Col xs={24} sm={6} xl={6} className={'flex items-center gap-2'}></Col>
          </Row>
          {assets.total > 0 && (
            <div className={'flex flex-col'}>
              {assets.items.map((item, index) => {
                return (
                  <AssetRowItem
                    assetAmountLabel={'Balance'}
                    assetMode={AssetRowType.WITHDRAW}
                    key={index}
                    item={item}
                    assetAmount={item.amountDeposit}
                    setMode={setMode}
                    setAssetSelected={setAssetSelected}
                  />
                )
              })}
            </div>
          )}
          {assets.total > 10 && (
            <div className={'flex justify-end pb-5'}>
              <Pagination
                size={'default'}
                className={'mt-5'}
                current={current}
                onChange={onChange}
                total={assets.total}
                showSizeChanger={false}
              />
            </div>
          )}
          {assetDeposits.length === 0 && <div className={'p-4 text-[#62758A]'}>No Supply</div>}
        </div>
      </Card>
    </Col>
  )
}
