import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Card, Col, Pagination, PaginationProps, Row, Typography } from 'antd'
import { AssetsContext } from '@/common/context'
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets'
import { AssetRowItem } from '@/common/components/Views/asset/AssetRowItem'
import { AssetRowType } from '@/common/components/Views/dashboard/YourSupplies'
import { LoadingAssets } from '@/common/components/LoadingAssets'
import { paginate } from '@/utils'

interface Props {
  setAssetSelected: (value: PoolAsset) => void
  setMode: (value: ManageAssetMode | AssetRowType) => void
}

export const AssetsBorrow: React.FunctionComponent<Props> = ({ setAssetSelected, setMode }) => {
  const { assetsMode, isLoading } = useContext(AssetsContext)
  const [current, setCurrent] = useState(1)

  const onChange: PaginationProps['onChange'] = (page) => {
    setCurrent(page)
  }

  useEffect(() => {
    if (assetsMode.length < 10) {
      setCurrent(1)
    }
  }, [assetsMode])

  const assets = useMemo(() => paginate(assetsMode, current, 10), [assetsMode, current])

  return (
    <Col xs={24} xl={12}>
      <Card className={' h-full rounded-[8px]'}>
        <div className={'flex flex-col h-auto sm:h-full'}>
          <div className={'flex justify-between items-center px-4 py-3'}>
            <Typography className={'text-[#090909] font-medium text-lg'}>Borrowing Assets</Typography>
          </div>
          <Row
            className={
              'justify-between items-start bg-[#F9F9FB] hidden sm:flex px-4 py-3 border-b border-t border-[#DCDFEA]'
            }
          >
            <Col xs={24} xl={6} className={'items-center text-[#62758A] font-medium'}>
              <Typography className={'px-4'}>Assets</Typography>
            </Col>
            <Col xl={6} className={'min-w-[100px] text-end text-[#62758A] font-medium flex-1 '}>
              <Typography className={'px-4'}>Available</Typography>
            </Col>
            <Col xl={6} className={'min-w-[100px] text-end text-[#62758A] font-medium flex-1 '}>
              <Typography className={'px-4'}>APR</Typography>
            </Col>
            <Col xs={24} xl={6} className={'flex items-center gap-2'}></Col>
          </Row>
          <div className={'flex flex-col'}>
            {!isLoading && assets.total > 0 && (
              <>
                {assets.items.map((item, index) => {
                  return (
                    <AssetRowItem
                      assetAmountLabel={'Available'}
                      assetMode={AssetRowType.BORROW}
                      key={index}
                      item={item}
                      assetAmount={item.totalBorrowAvailable}
                      setMode={setMode}
                      setAssetSelected={setAssetSelected}
                    />
                  )
                })}
              </>
            )}
          </div>
          {assets.total > 10 && (
            <div className={'flex justify-end mt-auto pb-5'}>
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
          {isLoading && <LoadingAssets />}
        </div>
      </Card>
    </Col>
  )
}
