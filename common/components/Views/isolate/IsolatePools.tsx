import { MAX_BPS } from '@/common/consts';
import { MesoContext } from '@/common/context';
import { useIsolatePools } from '@/common/hooks/useIsolatePools';
import useToken from '@/common/hooks/useTokens';
import { formatNumberBalance, nFormatter } from '@/utils';
import { Card, Table } from 'antd';
import BigNumber from 'bignumber.js';
import React, { useContext, useMemo } from 'react';
const PAGE_SIZE_OPTIONS = ['5', '10', '20', '50'];

export const IsolatePools: React.FunctionComponent = () => {
  const { tokens } = useContext(MesoContext);
  const { isolatePools } = useIsolatePools();

  const { getTokenByAddress } = useToken();

  const defaultColumns = useMemo(() => {
    return [
      {
        title: 'Assets',
        dataIndex: 'token',
        fixed: 'left',
        align: 'left',
        width: 200,
        render: (record: any, row: IsolatePools) => {
          return (
            <div className={'flex items-center gap-2'}>
              {row.collateral.map((item, index) => {
                return (
                  <div className={'flex items-center gap-2'} key={index}>
                    <div className={'w-[25px]'}>
                      <img
                        className={'w-[25px] h-auto'}
                        src={`https://image.meso.finance/${item.token?.symbol.toLowerCase()}.png`}
                        alt={''}
                      />
                    </div>
                    <div className={'font-medium'}>{item.token.symbol}</div>
                  </div>
                );
              })}{' '}
              -
              {row.liability.map((item, index) => {
                return (
                  <div className={'flex items-center gap-2'} key={index}>
                    <div className={'w-[25px]'}>
                      <img
                        className={'w-[25px] h-auto'}
                        src={`https://image.meso.finance/${item.token?.symbol.toLowerCase()}.png`}
                        alt={''}
                      />
                    </div>
                    <div className={'font-medium'}>{item.token.symbol}</div>
                  </div>
                );
              })}
            </div>
          );
        },
      },
      {
        title: 'Total Collateral',
        dataIndex: 'normaBps',
        align: 'right',
        width: 140,
        render: (record: any, row: IsolatePools) => (
          <div>
            <div className={'font-medium text-[#475467]'}>
              {nFormatter(
                BigNumber(row.collateral[0].poolSupply)
                  .div(BigNumber(10).pow(row.collateral[0].token.decimals))
                  .toNumber(),
              )}
            </div>
            <div className={'text-xs text-[#98A2B3]'}>
              $
              {nFormatter(
                BigNumber(row.collateral[0].poolSupply * row.collateral[0].token.price)
                  .div(BigNumber(10).pow(row.collateral[0].token.decimals))
                  .toNumber(),
              )}
            </div>
          </div>
        ),
      },
      {
        title: 'Total Supply',
        dataIndex: 'emodeBps',
        align: 'right',
        width: 140,
        render: (record: any, row: IsolatePools) => (
          <div>
            <div className={'font-medium text-[#475467]'}>
              {nFormatter(
                BigNumber(row.liability[0].poolSupply)
                  .div(BigNumber(10).pow(row.liability[0].token.decimals))
                  .toNumber(),
              )}
            </div>
            <div className={'text-xs text-[#98A2B3]'}>
              $
              {nFormatter(
                BigNumber(row.liability[0].poolSupply * row.liability[0].token.price)
                  .div(BigNumber(10).pow(row.liability[0].token.decimals))
                  .toNumber(),
              )}
            </div>
          </div>
        ),
      },
      {
        title: 'Supply APR',
        dataIndex: 'supplyApy',
        align: 'right',
        width: 150,

        render: (record: any, row: IsolatePools) => (
          <div>
            <div className={'text-sm font-medium text-[#039855]'}>
              {formatNumberBalance(row.liability[0].supplyApy, 2)}%
            </div>
          </div>
        ),
      },
      {
        title: 'Total Borrow',
        dataIndex: 'poolSupply',
        align: 'right',
        width: 140,
        render: (record: any, row: IsolatePools) => {
          return (
            <div>
              <div className={'font-medium text-[#475467]'}>
                {nFormatter(
                  BigNumber(row.liability[0].totalDebt)
                    .div(BigNumber(10).pow(row.liability[0].token.decimals))
                    .toNumber(),
                )}
              </div>
              <div className={'text-xs text-[#98A2B3]'}>
                $
                {nFormatter(
                  BigNumber(row.liability[0].totalDebt * row.liability[0].token.price)
                    .div(BigNumber(10).pow(row.liability[0].token.decimals))
                    .toNumber(),
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: 'Borrow APR',
        dataIndex: 'borrowApy',
        align: 'right',
        width: 120,

        render: (record: any, row: IsolatePools) => (
          <div>
            <div className={'text-sm font-medium text-[#D92D20]'}>
              {formatNumberBalance(row.liability[0].borrowApy, 2)}%
            </div>
          </div>
        ),
      },
      {
        title: 'Utilization ',
        dataIndex: 'totalDebt',
        align: 'right',
        width: 120,

        render: (record: any, row: IsolatePools) => (
          <div className={'text-sm text-[#475467] font-medium'}>
            {formatNumberBalance((row.liability[0].totalDebt / row.liability[0].poolSupply) * 100, 2)}%
          </div>
        ),
      },
      {
        title: 'Max LTV',
        dataIndex: '',
        align: 'right',
        width: 120,
        render: (record: any, row: IsolatePools) => {
          return (
            <div className={'text-sm text-[#475467] font-medium'}>{(row.collateral[0].normaBps / MAX_BPS) * 100}%</div>
          );
        },
      },
      {
        title: 'Collateral Price',
        dataIndex: 'normaBps',
        align: 'right',
        width: 140,
        render: (record: any, row: IsolatePools) => {
          const token = getTokenByAddress(row.collateral[0].tokenAddress);
          return (
            <div>
              <div className={'text-[#475467] font-medium'}>${formatNumberBalance(token?.price, 4)}</div>
            </div>
          );
        },
      },
      {
        title: 'Liability Price',
        dataIndex: 'normaBps',
        align: 'right',
        width: 140,
        render: (record: any, row: IsolatePools) => {
          const token = getTokenByAddress(row.liability[0].tokenAddress);
          return <div className={'text-[#475467] font-medium'}>${formatNumberBalance(token?.price)}</div>;
        },
      },
    ];
  }, [tokens]);

  const locale = {
    emptyText: (
      <React.Fragment>
        <div className={'py-20 text-[#000] dark:text-white'}>No data</div>
      </React.Fragment>
    ),
  };

  return (
    <div className={'mt-20'}>
      <h2 className={'text-center text-xl font-semibold text-[#101828]'}>Isolated Pools</h2>
      <Card bordered={false} className={'w-full border border-[#EFF1F5]  card-shadow rounded-[16px] mt-8 p-3 sm:p-5'}>
        <Table
          showSorterTooltip={false}
          locale={locale}
          className={'table-leaderboard'}
          scroll={{ x: 'max-content' }}
          rowKey={(row: any) => row?.id}
          pagination={{
            // total: allAssetsData.length,
            showSizeChanger: false,
            pageSizeOptions: PAGE_SIZE_OPTIONS,
            locale: { items_per_page: '' },

            showTotal: (total, range) => {
              return (
                <>
                  Show {range[0]} - {range[1]} / Total {total}
                </>
              );
            },
          }}
          onChange={() => {}}
          dataSource={isolatePools as any}
          columns={defaultColumns as any}
        />
      </Card>
    </div>
  );
};
