import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Card, Col, Pagination, PaginationProps, Row, Switch, Typography } from 'antd'
import { AssetsContext } from '@/common/context'
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets'
import { AssetRowItem } from '@/common/components/Views/asset/AssetRowItem'
import { AssetRowType } from '@/common/components/Views/dashboard/YourSupplies'
import { LoadingAssets } from '@/common/components/LoadingAssets'
import { getData, setData } from '@/common/hooks/useLocalStoragre'
import { paginate } from '@/utils'

interface Props {
  setAssetSelected: (value: PoolAsset) => void
  setMode: (value: ManageAssetMode | AssetRowType) => void
}

export const AssetsSupply: React.FunctionComponent<Props> = ({ setAssetSelected, setMode }) => {
  const { allAssetsData, isLoading } = useContext(AssetsContext)
  const [hiddenNoAssets, setHiddenNoAssets] = useState<boolean>(true)
  const [current, setCurrent] = useState(1)

  useEffect(() => {
    if (getData('hidden0Balance')) {
      setHiddenNoAssets(getData('hidden0Balance') === 'true')
    }
  }, [])

  const handleChange = (checked: boolean) => {
    setHiddenNoAssets(checked)
    setData('hidden0Balance', checked)
  }

  const totalAsset0Balance = useMemo(() => allAssetsData.filter((item) => item.walletBalance > 0), [allAssetsData])

  const filterData = useMemo(() => {
    let data = allAssetsData.sort((a, b) => b.walletBalance * b.token.price - a.walletBalance * a.token.price)
    if (hiddenNoAssets) {
      data = allAssetsData.filter((item) => item.walletBalance > 0)
    }
    return data
  }, [allAssetsData, hiddenNoAssets])

  useEffect(() => {
    if (filterData.length <= 10) {
      setCurrent(1)
    }
  }, [filterData])

  const assets = useMemo(() => paginate(filterData, current, 10), [filterData, current, hiddenNoAssets])

  const onChange: PaginationProps['onChange'] = (page) => {
    setCurrent(page)
  }

  return (
    <Col xs={24} xl={12}>
      <Card className=" h-full rounded-[8px]">
        <div className="flex flex-col h-auto sm:h-full">
          <div className="flex sm:flex-row flex-col items-start justify-between gap-2 sm:items-center px-4 py-3">
            <Typography className="text-[#090909] font-medium text-lg">Collateral Assets</Typography>
            <div className="flex gap-2 items-center">
              <span>Show only sufficient collaterals ({totalAsset0Balance.length})</span>
              <Switch checked={hiddenNoAssets} onChange={handleChange} />
            </div>
          </div>
          <Row className="justify-between items-start bg-[#F9F9FB] hidden sm:flex px-4 py-3 border-b border-t border-[#DCDFEA]">
            <Col xs={24} xl={6} className="items-center text-[#62758A] font-medium">
              <Typography className="px-4">Assets</Typography>
            </Col>
            <Col xl={6} className="min-w-[100px] text-end flex-1 text-[#62758A] font-medium">
              <Typography className="px-4">Wallet Balance</Typography>
            </Col>
            <Col xl={6} className="min-w-[100px] text-end flex-1 text-[#62758A] font-medium">
              <Typography className="px-4">APR</Typography>
            </Col>
            <Col xs={24} xl={6} className="flex items-center gap-2"></Col>
          </Row>
          <div className="flex flex-col">
            {!isLoading && assets.total > 0 && (
              <>
                {assets.items.map((item, index) => {
                  return (
                    <AssetRowItem
                      assetAmountLabel="Wallet Balance"
                      assetMode={AssetRowType.SUPPLY}
                      key={index}
                      item={item}
                      assetAmount={item?.walletBalance ?? 0}
                      setMode={setMode}
                      setAssetSelected={setAssetSelected}
                    />
                  )
                })}
              </>
            )}
          </div>
          {assets.total > 10 && (
            <div className="flex justify-end mt-auto pb-5">
              <Pagination
                size="default"
                className="mt-5"
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
