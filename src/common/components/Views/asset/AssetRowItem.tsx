import React from 'react'
import { Button, Col, Row, Typography } from 'antd'
import { formatNumberBalance, nFormatter } from '@/utils'
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets'
import { AssetRowType } from '@/common/components/Views/dashboard/YourSupplies'
import { useRouter } from 'next/router'
import { PoolSupplyApr } from '@/common/components/Views/asset/PoolSupplyApr'
import { PoolBorrowApr } from '@/common/components/Views/asset/PoolBorrowApr'
import useTokens from '@/common/hooks/useTokens'
import { isMobile } from 'react-device-detect'

interface Props {
  assetMode: AssetRowType
  item: PoolAsset
  assetAmountLabel: string
  assetAmount: number
  setMode: (value: ManageAssetMode | AssetRowType) => void
  setAssetSelected: (value: PoolAsset) => void
}

export const AssetRowItem: React.FunctionComponent<Props> = ({
  item,
  assetAmountLabel,
  assetAmount,
  setMode,
  setAssetSelected,
  assetMode,
}) => {
  const isBorrow = assetMode === AssetRowType.BORROW || assetMode === AssetRowType.REPAY
  const isSupply = assetMode === AssetRowType.WITHDRAW || assetMode === AssetRowType.SUPPLY
  const router = useRouter()
  const { getTokenBySymbol } = useTokens()
  return (
    <div className={'w-full'}>
      <Row
        gutter={[
          { xs: 16, sm: 16, xl: 0 },
          { xs: 16, sm: 16, xl: 0 },
        ]}
        className={'flex justify-between mx-0 cursor-pointer items-start hover:bg-[#F5F7F9] transition'}
      >
        <Col
          onClick={() => (!isMobile ? router.push(`/asset/${item.poolAddress}`) : null)}
          xs={24}
          sm={12}
          md={6}
          xl={6}
          className={'items-center pb-0 sm:pb-4 p-4 h-full'}
        >
          <div className={'flex items-center'}>
            <div>
              <div className={'w-[32px]'}>
                <img
                  className={'w-[32px] h-auto'}
                  src={`https://image.meso.finance/${item.token?.symbol.toLowerCase()}.png`}
                  alt={''}
                />
              </div>
            </div>
            <div className={'min-w-[100px] ml-2'}>
              <Typography className={'text-[#5D6B98] text-sm sm:text-sm font-medium'}>{item?.token?.symbol}</Typography>
              <span className={'text-xs text-[#5D6B98]'}>
                ${formatNumberBalance(getTokenBySymbol(item.token.symbol)?.price ?? 0, 4)}
              </span>
            </div>
          </div>
        </Col>
        <Col
          onClick={() => (!isMobile ? router.push(`/asset/${item.poolAddress}`) : null)}
          xs={24}
          sm={12}
          md={6}
          xl={6}
          className={'min-w-[100px] flex-1 text-start sm:text-end pt-0 sm:pt-4 p-4 h-full'}
        >
          <Typography className={'text-[#5A5A5A] block sm:hidden font-medium'}>{assetAmountLabel}</Typography>
          <Typography className={'text-[#090909] flex flex-col text-base'}>
            <span className={'text-[#30374F] font-medium'}>{formatNumberBalance(assetAmount ?? 0, 3)}</span>
            <span className={'text-xs text-[#30374F]'}>
              ${nFormatter(item?.token?.price ? (assetAmount ?? 0) * item?.token?.price : 0)}
            </span>
          </Typography>
        </Col>
        <Col
          onClick={() => (!isMobile ? router.push(`/asset/${item.poolAddress}`) : null)}
          xs={24}
          sm={12}
          md={6}
          xl={6}
          className={'min-w-[100px] flex-1 pt-0 sm:pt-4 p-4 h-full'}
        >
          <Typography className={'text-[#5A5A5A] text-end block sm:hidden font-medium'}>APR</Typography>
          <Typography className={'text-[#090909] text-start sm:text-end text-base'}>
            {isSupply && (
              <div>
                <div className={'flex justify-end items-center gap-2'}>
                  <PoolSupplyApr asset={item} />
                </div>
              </div>
            )}
            {isBorrow && (
              <div>
                <div className={'flex justify-end items-center gap-2'}>
                  <PoolBorrowApr asset={item} />
                </div>
              </div>
            )}
          </Typography>
        </Col>
        <Col xs={24} sm={24} md={6} xl={6} className={'flex items-center justify-start sm:justify-end gap-2 p-4'}>
          <div className={'flex w-full justify-end gap-2'}>
            <Button
              onClick={() => {
                router.push(`/asset/${item.poolAddress}`)
              }}
              className={
                'bg-transparent h-9 flex sm:hidden flex-1 w-full justify-center items-center border-[#7F56D9] font-medium text-[#7F56D9] rounded-full max-w-full sm:max-w-[110px]'
              }
            >
              See Details
            </Button>
            <Button
              onClick={() => {
                setMode(assetMode)
                setAssetSelected(item)
              }}
              className={
                'bg-transparent h-9 flex flex-1 w-full justify-center items-center border-[#7F56D9] font-medium text-[#7F56D9] rounded-full max-w-full sm:max-w-[110px]'
              }
            >
              {assetMode === AssetRowType.BORROW && 'Borrow'}
              {assetMode === AssetRowType.WITHDRAW && 'Withdraw'}
              {assetMode === AssetRowType.SUPPLY && 'Supply'}
              {assetMode === AssetRowType.REPAY && 'Repay'}
            </Button>
          </div>
          {/*<Link className={' w-full'} href={`/asset/${item.poolAddress}`}>*/}
          {/*  <Button className={'text-[#090909] w-full border-[#E5E7F1] min-w-[95px]'}>Details</Button>*/}
          {/*</Link>*/}
        </Col>
      </Row>
    </div>
  )
}
