import { Skeleton, Table } from 'antd';
import React from 'react';

export const AssetsTableLoading: React.FunctionComponent = () => {
  const defaultColumns: (any[number] & {
    editable?: boolean;
    dataIndex: string;
  })[] = [
    {
      title: 'Assets',
      dataIndex: 'token',
      align: 'left',
      width: '10%',
      render: (record: any, row: PoolAsset) => (
        <div className={'flex items-center gap-2'}>
          <Skeleton.Avatar active />
          <Skeleton.Button className={'w-[100px] h-6'} active />
        </div>
      ),
    },
    {
      title: 'LTV',
      dataIndex: 'normaBps',
      align: 'right',
      width: '15%',
      render: (record: any, row: PoolAsset) => (
        <div>
          <Skeleton.Button className={'w-[100px] h-6'} active />
        </div>
      ),
    },
    {
      title: 'Supply APR',
      dataIndex: 'supplyApy',
      align: 'right',
      width: '15%',
      sorter: (a: PoolAsset, b: PoolAsset) => a.supplyApy - b.supplyApy,

      render: (record: any, row: PoolAsset) => (
        <div>
          <Skeleton.Button className={'w-[100px] h-6'} active />
        </div>
      ),
    },
    {
      title: 'Market Size',
      dataIndex: 'poolSupply',
      align: 'right',
      render: (record: any, row: PoolAsset) => (
        <div className={' text-base'}>
          <Skeleton.Button className={'w-[100px] h-6'} active />
        </div>
      ),
    },
    {
      title: 'Borrow APR',
      dataIndex: 'borrowApy',
      align: 'right',
      sorter: (a: PoolAsset, b: PoolAsset) => a.borrowApy - b.borrowApy,
      render: (record: any, row: PoolAsset) => (
        <div>
          <Skeleton.Button className={'w-[100px] h-6'} active />
        </div>
      ),
    },
    {
      title: 'Total Borrowed',
      dataIndex: 'totalDebt',
      align: 'right',

      render: (record: any, row: any) => (
        <div className={' text-base'}>
          <Skeleton.Button className={'w-[100px] h-6'} active />
        </div>
      ),
    },
    {
      title: 'Wallet',
      dataIndex: 'walletBalance',
      align: 'right',

      render: (record: any, row: PoolAsset) => (
        <div className={' text-base'}>
          <Skeleton.Button className={'w-[100px] h-6'} active />
        </div>
      ),
    },
  ];
  return (
    <Table
      showSorterTooltip={false}
      className={'table-leaderboard'}
      scroll={{ x: 'max-content' }}
      rowKey={(row: any) => row?.id}
      pagination={false}
      onChange={() => {}}
      dataSource={Array.from(new Array(10))}
      columns={defaultColumns as any}
    />
  );
};
