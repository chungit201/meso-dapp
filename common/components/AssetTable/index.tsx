import React from 'react'
import { Table } from 'antd'

interface Props {
  data: any[]
  columns?: any[]
  localeText?: string
}

export const AssetTable: React.FunctionComponent<Props> = ({ data, columns, localeText }) => {
  const locale = {
    emptyText: (
      <React.Fragment>
        <div className={'py-0 text-[#adb8d8] text-start dark:text-white'}>{localeText}</div>
      </React.Fragment>
    ),
  }

  return (
    <Table
      locale={locale}
      className={'table-leaderboard'}
      rowKey={(row: any) => row?.id}
      pagination={false}
      onChange={() => {}}
      dataSource={data ?? []}
      columns={columns as any}
    />
  )
}
