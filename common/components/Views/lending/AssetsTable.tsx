import React, { useContext, useEffect, useMemo } from 'react'
import { Button, Card, Checkbox, Col, Popover, Row, Table, Typography } from 'antd'
import { ModalManageAssets } from '@/common/components/Modals/ModalManageAssets'
import { formatNumberBalance, nFormatter } from '@/utils'
import BigNumber from 'bignumber.js'
import { AssetsContext, MesoContext } from '@/common/context'
import { MAX_BPS } from '@/common/consts'
import { useRouter } from 'next/router'
import { AssetsTableLoading } from '@/common/components/LoadingAssets/AssetsTableLoading'
import useUser from '@/common/hooks/useUser'
import { MarketsMobile } from '@/common/components/MarketsMobile'
import { AssetsLoadingMobile } from '@/common/components/LoadingAssets/AssetsLoadingMobile'
import { DownBrowIcon, SettingIcon } from '@/common/components/Icons'
import { getData, setData } from '@/common/hooks/useLocalStoragre'
import { PoolBorrowApr } from '@/common/components/Views/asset/PoolBorrowApr'
import { PoolSupplyApr } from '@/common/components/Views/asset/PoolSupplyApr'
import useToken from '@/common/hooks/useTokens'

export enum ASSETS_TABLE_KEYS {
  ASSETS = 'ASSETS',
  LTV = 'LTV',
  EMODE_LTV = 'EMODE_LTV',
  SUPPLY_APR = 'SUPPLY_APR',
  MARKET_SIZE = 'MARKET_SIZE',
  BORROW_APR = 'BORROW_APR',
  TOTAL_DEBT = 'TOTAL_DEBT',
  UTILIZATION = 'UTILIZATION',
  LIQUIDATION_THRESHOLD = 'LIQUIDATION_THRESHOLD',
  EMODE_LIQUIDATION_THRESHOLD = 'EMODE_LIQUIDATION_THRESHOLD',
  WALLET = 'WALLET',
}

const filterDefault = [
  ASSETS_TABLE_KEYS.ASSETS,
  ASSETS_TABLE_KEYS.LTV,
  ASSETS_TABLE_KEYS.EMODE_LTV,
  ASSETS_TABLE_KEYS.SUPPLY_APR,
  ASSETS_TABLE_KEYS.MARKET_SIZE,
  ASSETS_TABLE_KEYS.BORROW_APR,
  ASSETS_TABLE_KEYS.TOTAL_DEBT,
  ASSETS_TABLE_KEYS.UTILIZATION,
  ASSETS_TABLE_KEYS.WALLET,
]

const PAGE_SIZE_OPTIONS = ['5', '10', '20', '50']

export const AssetsTable: React.FunctionComponent = () => {
  const [filter, setFilter] = React.useState(filterDefault)
  const [assetSelected, setAssetSelected] = React.useState<PoolAsset | null>(null)
  const { allAssetsData, isLoading } = useContext(AssetsContext)
  const { userEMode } = useUser()
  const router = useRouter()
  const { getTokenBySymbol } = useToken()
  const { tokens } = useContext(MesoContext)

  useEffect(() => {
    getData('marketFilter') ? setFilter(JSON.parse(getData('marketFilter') as any)) : setFilter(filterDefault)
  }, [])

  useEffect(() => {
    setData('marketFilter', JSON.stringify(filter))
  }, [filter])

  const defaultColumns = useMemo(() => {
    const columns = [
      {
        key: ASSETS_TABLE_KEYS.ASSETS,
        title: 'Assets',
        dataIndex: 'token',
        fixed: 'left',
        align: 'left',
        width: 200,
        sorter: (a: PoolAsset, b: PoolAsset) => a.token.symbol.localeCompare(b.token.symbol),
        render: (record: any, row: PoolAsset) => {
          return (
            <div className={'flex items-center gap-2'}>
              <div className={'w-[32px]'}>
                <img
                  className={'w-[32px] h-auto'}
                  src={`https://image.meso.finance/${record?.symbol.toLowerCase()}.png`}
                  alt={''}
                />
              </div>
              <div>
                <Typography className={'text-[#667085] text-sm font-medium'}>{row.token.symbol}</Typography>
                <span className={'text-xs text-[#5D6B98]'}>
                  ${formatNumberBalance(getTokenBySymbol(row.token.symbol)?.price ?? 0, 4)}
                </span>
              </div>
            </div>
          )
        },
      },
      {
        key: ASSETS_TABLE_KEYS.LTV,
        title: 'LTV',
        dataIndex: 'normaBps',
        align: 'right',
        width: 110,
        sorter: (a: PoolAsset, b: PoolAsset) => a.normaBps - b.normaBps,
        render: (record: any, row: PoolAsset) => (
          <div>
            <div className={'text-base text-[#1D2939] text-sm font-medium'}>{(row.normaBps / MAX_BPS) * 100}%</div>
          </div>
        ),
      },
      {
        key: ASSETS_TABLE_KEYS.EMODE_LTV,
        title: 'E-Mode LTV',
        dataIndex: 'emodeBps',
        align: 'right',
        width: 140,
        sorter: (a: PoolAsset, b: PoolAsset) => (userEMode ? a.emodeBps - b.emodeBps : a.emodeBps - b.emodeBps),
        render: (record: any, row: PoolAsset) => (
          <div>
            <div className={'text-base text-[#1D2939] text-sm font-medium'}>
              {row.emodeId ? `${(row.emodeBps / MAX_BPS) * 100}%` : 'N/A'}
            </div>
          </div>
        ),
      },
      {
        key: ASSETS_TABLE_KEYS.SUPPLY_APR,
        title: 'Supply APR',
        dataIndex: 'supplyApy',
        align: 'right',
        width: 150,
        sorter: (a: PoolAsset, b: PoolAsset) => {
          const totalApyA = a.supplyApy + a.incentiveSupplyApy + a.stakingApr
          const totalApyB = b.supplyApy + b.incentiveSupplyApy + b.stakingApr
          return totalApyA - totalApyB
        },
        render: (record: any, row: PoolAsset) => (
          <div>
            <div className={'flex justify-end items-center gap-2'}>
              <PoolSupplyApr asset={row} />
            </div>
          </div>
        ),
      },
      {
        key: ASSETS_TABLE_KEYS.MARKET_SIZE,
        title: 'Market Size',
        dataIndex: 'poolSupply',
        align: 'right',
        width: 200,
        sorter: (a: PoolAsset, b: PoolAsset) =>
          (a.poolSupply / 10 ** a.token.decimals) * a.token.price -
          (b.poolSupply / 10 ** b.token.decimals) * b.token.price,
        render: (record: any, row: PoolAsset) => {
          const totalDolar = BigNumber(record).div(BigNumber(10).pow(row.token.decimals)).toNumber() * row.token.price
          return (
            <div className={'text-sm'}>
              <div className={'text-[#30374F] font-medium'}>
                {nFormatter(Number(BigNumber(record).div(BigNumber(10).pow(row.token.decimals)).toNumber().toFixed(2)))}{' '}
                {row.token.symbol}
              </div>
              <div className={'text-xs text-[#5D6B98]'}>${nFormatter(totalDolar < 0.01 ? 0 : totalDolar)}</div>
            </div>
          )
        },
      },
      {
        key: ASSETS_TABLE_KEYS.BORROW_APR,
        title: 'Borrow APR',
        dataIndex: 'borrowApy',
        align: 'right',
        width: 150,
        sorter: (a: PoolAsset, b: PoolAsset) =>
          a.borrowApy + a.incentiveBorrowApy - (b.borrowApy + b.incentiveBorrowApy),
        render: (record: any, row: PoolAsset) => (
          <div>
            <div className={'flex justify-end items-center gap-2'}>
              <PoolBorrowApr asset={row} />
            </div>
          </div>
        ),
      },
      {
        key: ASSETS_TABLE_KEYS.TOTAL_DEBT,
        title: 'Total Borrowed',
        dataIndex: 'totalDebt',
        align: 'right',
        width: 180,
        sorter: (a: PoolAsset, b: PoolAsset) =>
          (a.totalDebt / 10 ** a.token.decimals) * a.token.price -
          (b.totalDebt / 10 ** b.token.decimals) * b.token.price,
        render: (record: any, row: any) => (
          <div className={'text-sm'}>
            <div className={'text-[#30374F] font-medium'}>
              {nFormatter(BigNumber(record).div(BigNumber(10).pow(row.token.decimals)).toNumber())} {row.token.symbol}
            </div>
            <div className={'text-xs text-[#5D6B98]'}>
              ${nFormatter(BigNumber(record).div(BigNumber(10).pow(row.token.decimals)).toNumber() * row.token.price)}
            </div>
          </div>
        ),
      },
      // {
      //   title: 'Max Loop (%)',
      //   dataIndex: 'normaBps',
      //   align: 'right',
      //   width: 150,
      //   sorter: (a: PoolAsset, b: PoolAsset) => (userEMode ? a.emodeBps - b.emodeBps : a.normaBps - b.normaBps),
      //   render: (record: any, row: PoolAsset) => (
      //     <div>
      //       <div className={'text-base text-[#1D2939] font-medium'}>
      //         {userEMode && row.emodeId === userEMode ? (row.emodeBps / MAX_BPS) * 100 : (record / MAX_BPS) * 100}%
      //       </div>
      //     </div>
      //   ),
      // },
      {
        key: ASSETS_TABLE_KEYS.UTILIZATION,
        title: 'Utilization',
        dataIndex: '',
        align: 'right',
        width: 150,
        sorter: (a: PoolAsset, b: PoolAsset) => a.totalDebt / a.poolSupply - a.totalDebt / a.poolSupply,
        render: (record: any, row: PoolAsset) => (
          <div>
            <div className={'text-sm text-[#1D2939] font-medium'}>
              {formatNumberBalance((row.totalDebt / row.poolSupply) * 100, 2)}%
            </div>
          </div>
        ),
      },
      {
        key: ASSETS_TABLE_KEYS.LIQUIDATION_THRESHOLD,
        title: 'Liquidation Threshold',
        dataIndex: 'normaBps',
        align: 'right',
        width: 200,
        sorter: (a: PoolAsset, b: PoolAsset) => a.liquidationThresholdBps - b.liquidationThresholdBps,
        render: (record: any, row: PoolAsset) => (
          <div>
            <div className={'text-sm text-[#1D2939] font-medium'}>
              {formatNumberBalance((row.liquidationThresholdBps / MAX_BPS) * 100, 2)}%
            </div>
          </div>
        ),
      },
      {
        key: ASSETS_TABLE_KEYS.EMODE_LIQUIDATION_THRESHOLD,
        title: 'E-Mode Liquidation Threshold',
        dataIndex: 'normaBps',
        align: 'right',
        width: 230,
        sorter: (a: PoolAsset, b: PoolAsset) => a.emodeLiquidationThresholdBps - b.emodeLiquidationThresholdBps,
        render: (record: any, row: PoolAsset) => (
          <div>
            <div className={'text-sm text-[#1D2939] font-medium'}>
              {row.emodeId ? `${(row.emodeLiquidationThresholdBps / MAX_BPS) * 100}%` : 'N/A'}
            </div>
          </div>
        ),
      },
      {
        key: ASSETS_TABLE_KEYS.WALLET,
        title: 'Wallet',
        dataIndex: 'walletBalance',
        align: 'right',
        width: 150,
        sorter: (a: PoolAsset, b: PoolAsset) => a.walletBalance * a.token.price - b.walletBalance * b.token.price,
        render: (record: any, row: PoolAsset) => (
          <div className={'text-sm'}>
            <div className={'text-[#30374F] font-medium'}>
              {formatNumberBalance(record, 2)} {row.token.symbol}
            </div>
            <div className={'text-xs text-[#5D6B98]'}>${formatNumberBalance(record * row.token.price, 4)}</div>
          </div>
        ),
      },
    ]
    const filterData = columns.filter((column) => filter.includes(column.key))
    return filterData
  }, [filter, tokens, allAssetsData])

  const locale = {
    emptyText: (
      <React.Fragment>
        <div className={'py-20 text-[#000] dark:text-white'}>No data</div>
      </React.Fragment>
    ),
  }

  const handleFilter = (checked: boolean, key: ASSETS_TABLE_KEYS) => {
    if (checked) {
      setFilter([...filter, key])
    } else {
      const data = filter.filter((x) => x !== key)
      setFilter(data)
    }
  }

  return (
    <Col span={24}>
      <Card bordered={false} className={'w-full border border-[#EFF1F5]  card-shadow rounded-[16px] p-3 sm:p-5'}>
        <div className={'flex justify-between'}>
          <Typography className={'text-lg sm:text-xl font-semibold text-[#101828]'}>Assets Dashboard</Typography>
          <div className={'hidden md:block'}>
            <Popover
              overlayClassName={'popover-setting'}
              placement={'bottomRight'}
              trigger={['click']}
              content={
                <div className={'p-5'}>
                  <Row>
                    <Col span={10}>
                      <div className={'flex flex-col text-xs gap-3'}>
                        <div className={'flex items-center gap-2'}>
                          <Checkbox
                            onChange={(e: any) => handleFilter(e.target.checked, ASSETS_TABLE_KEYS.LTV)}
                            checked={filter.includes(ASSETS_TABLE_KEYS.LTV)}
                          />{' '}
                          LTV
                        </div>
                        <div className={'flex items-center gap-2'}>
                          <Checkbox
                            onChange={(e: any) => handleFilter(e.target.checked, ASSETS_TABLE_KEYS.EMODE_LTV)}
                            checked={filter.includes(ASSETS_TABLE_KEYS.EMODE_LTV)}
                          />{' '}
                          E-Mode LTV
                        </div>
                        <div className={'flex items-center gap-2'}>
                          <Checkbox
                            onChange={(e: any) => handleFilter(e.target.checked, ASSETS_TABLE_KEYS.SUPPLY_APR)}
                            checked={filter.includes(ASSETS_TABLE_KEYS.SUPPLY_APR)}
                          />{' '}
                          Supply APR
                        </div>
                        <div className={'flex items-center gap-2'}>
                          <Checkbox
                            onChange={(e: any) => handleFilter(e.target.checked, ASSETS_TABLE_KEYS.MARKET_SIZE)}
                            checked={filter.includes(ASSETS_TABLE_KEYS.MARKET_SIZE)}
                          />{' '}
                          Market Size
                        </div>
                        <div className={'flex items-center gap-2'}>
                          <Checkbox
                            onChange={(e: any) => handleFilter(e.target.checked, ASSETS_TABLE_KEYS.BORROW_APR)}
                            checked={filter.includes(ASSETS_TABLE_KEYS.BORROW_APR)}
                          />{' '}
                          Borrow APR
                        </div>
                      </div>
                    </Col>
                    <Col span={14}>
                      <div className={'flex flex-col text-xs gap-3'}>
                        <div className={'flex items-center gap-2'}>
                          <Checkbox
                            onChange={(e: any) => handleFilter(e.target.checked, ASSETS_TABLE_KEYS.TOTAL_DEBT)}
                            checked={filter.includes(ASSETS_TABLE_KEYS.TOTAL_DEBT)}
                          />{' '}
                          Total Borrowed
                        </div>
                        <div className={'flex items-center gap-2'}>
                          <Checkbox
                            onChange={(e: any) => handleFilter(e.target.checked, ASSETS_TABLE_KEYS.UTILIZATION)}
                            checked={filter.includes(ASSETS_TABLE_KEYS.UTILIZATION)}
                          />{' '}
                          Utilization
                        </div>
                        <div className={'flex items-center gap-2'}>
                          <Checkbox
                            onChange={(e: any) =>
                              handleFilter(e.target.checked, ASSETS_TABLE_KEYS.LIQUIDATION_THRESHOLD)
                            }
                            checked={filter.includes(ASSETS_TABLE_KEYS.LIQUIDATION_THRESHOLD)}
                          />{' '}
                          Liquidation Threshold
                        </div>
                        <div className={'flex items-center gap-2'}>
                          <Checkbox
                            onChange={(e: any) => handleFilter(e.target.checked, ASSETS_TABLE_KEYS.WALLET)}
                            checked={filter.includes(ASSETS_TABLE_KEYS.WALLET)}
                          />{' '}
                          Wallet Balance
                        </div>
                        <div className={'flex items-center gap-2'}>
                          <Checkbox
                            onChange={(e: any) =>
                              handleFilter(e.target.checked, ASSETS_TABLE_KEYS.EMODE_LIQUIDATION_THRESHOLD)
                            }
                            checked={filter.includes(ASSETS_TABLE_KEYS.EMODE_LIQUIDATION_THRESHOLD)}
                          />{' '}
                          E-Mode Liquidation Threshold
                        </div>
                      </div>
                    </Col>
                  </Row>
                  <Button
                    onClick={() => setFilter(filterDefault)}
                    className={'text-[#7F56D9] shadow-none border-0 px-0'}
                  >
                    Reset
                  </Button>
                </div>
              }
            >
              <Button
                className={`flex justify-center text-[#313547] items-center gap-1 h-9 ${filterDefault === filter ? 'border-[#DCDFEA]' : 'border-[#7F56D9]'} rounded-full`}
              >
                <SettingIcon />
                Data settings
                <DownBrowIcon />
              </Button>
            </Popover>
          </div>
        </div>
        <div className={'w-full hidden md:block mt-6'}>
          {!isLoading && allAssetsData.length > 0 && (
            <Table
              loading={isLoading}
              showSorterTooltip={false}
              locale={locale}
              className={'table-leaderboard'}
              scroll={{ x: 'max-content' }}
              rowKey={(row: any) => row?.id}
              pagination={{
                total: allAssetsData.length,
                showSizeChanger: false,
                pageSizeOptions: PAGE_SIZE_OPTIONS,
                locale: { items_per_page: '' },

                showTotal: (total, range) => {
                  return (
                    <>
                      Show {range[0]} - {range[1]} / Total {total}
                    </>
                  )
                },
              }}
              onChange={() => {}}
              dataSource={allAssetsData ?? []}
              columns={defaultColumns as any}
              onRow={(record) => {
                return {
                  onClick: async (e) => {
                    await router.push('/asset/' + record.poolAddress)
                  },
                }
              }}
            />
          )}
          {isLoading && <AssetsTableLoading />}
        </div>
        {!isLoading && <MarketsMobile allAssetsData={allAssetsData} />}
        {isLoading && <AssetsLoadingMobile />}
        <ModalManageAssets
          isModalOpen={!!assetSelected}
          handleClose={() => setAssetSelected(null)}
          asset={assetSelected!}
        />
      </Card>
    </Col>
  )
}
