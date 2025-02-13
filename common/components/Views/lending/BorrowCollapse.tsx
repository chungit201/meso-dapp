import React, { useEffect, useState } from 'react'
import { Card, Col, Typography } from 'antd'
import { useAssets } from '@/common/hooks/assets/useAssets'
import { formatNumberBalance } from '@/utils'
import { ManageAssetMode, ModalManageAssets } from '@/common/components/Modals/ModalManageAssets'
import { useModal } from '@/common/hooks/useModal'

export const BorrowCollapse: React.FunctionComponent = () => {
  const { assetDebts } = useAssets()
  const [totalBalance, setTotalBalance] = useState(0)
  const [asset, setAsset] = useState<PoolAsset | null>(null)
  const { show, setShow, toggle } = useModal()

  useEffect(() => {
    let total = 0
    for (const item of assetDebts) {
      total += item.debtAmount * item?.token?.price
    }
    setTotalBalance(total)
  }, [assetDebts])

  return (
    <Col xs={24} xl={8}>
      <Card className={'border-[#F3F5F8] rounded-[12px]'}>
        <div
          className={
            'bg-[#F3F5F8] flex justify-between items-center text-lg min-h-[56px] p-3 rounded-tl-[12px] rounded-tr-[12px]'
          }
        >
          <Typography>Borrow</Typography>
          <Typography>${formatNumberBalance(totalBalance, 2)}</Typography>
        </div>
        <div className={'min-h-[150px] overflow-y-auto'}>
          {assetDebts.map((item, index) => {
            return (
              <div
                onClick={() => {
                  setAsset(item)
                  setShow(true)
                }}
                className={
                  'p-3 asset-row cursor-pointer hover:bg-[#F3F5F8] hover:bg-opacity-30 flex justify-between border-b border-b-[#F3F5F8]'
                }
                key={index}
              >
                <div className={'flex items-center gap-2'}>
                  <img
                    className={'w-[25px] h-auto'}
                    src={`https://image.meso.finance/${item.token?.symbol.toLowerCase()}.png`}
                    alt={''}
                  />
                  <Typography className={'text-base'}>{item?.token?.symbol}</Typography>
                </div>
                <Typography>${formatNumberBalance(item.debtAmount * item?.token?.price, 2)}</Typography>
              </div>
            )
          })}
        </div>
      </Card>
      <ModalManageAssets mode={ManageAssetMode.Borrow} isModalOpen={!!show} handleClose={toggle} asset={asset!} />
    </Col>
  )
}
