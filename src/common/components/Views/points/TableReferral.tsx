import React, { useEffect, useState } from 'react'
import { Col, Pagination, Row, Skeleton, Tooltip } from 'antd'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { getRefInfo } from '@/common/services/points'
import { copyToClipboard, ellipseAddress, formatNumberBalance } from '@/utils'
import { CopyIcon } from '@/common/components/Icons'

export const TableReferral: React.FunctionComponent = () => {
  const { account } = useWallet()
  const [totalItems, setTotalItems] = useState(0)
  const [page, setPage] = useState(1)
  const [copyText, setCopyText] = useState('Copy')

  const { data: { items = [], total = 0 } = {}, isFetching } = useQuery({
    queryKey: ['ReferralPoints', page, account],
    queryFn: async () => {
      const { data } = await getRefInfo(account?.address as string, page)
      return { items: data.datas, total: data.total }
    },
    enabled: !!account?.address,
  })

  useEffect(() => {
    if (total > 0) {
      setTotalItems(total)
    }
  }, [total])

  const onChange = (pageNum: number, pageSize: number) => {
    setPage(pageNum)
  }

  const handleCopy = (value: string) => {
    setCopyText('Copied!')
    setTimeout(() => {
      setCopyText('Copy')
    }, 1000)
    copyToClipboard(value)
  }

  return (
    <>
      <div>
        <div className={'border border-[#F2F4F7] text-[#475467] mt-8  overflow-x-auto rounded-[12px]'}>
          <div className={'min-w-[845px]'}>
            <Row className={'bg-[#F9FAFB] p-4'}>
              <Col className={'font-medium'} span={2}>
                No.
              </Col>
              <Col className={'font-medium'} span={18}>
                Friend’s wallet address
              </Col>
              <Col className={'font-medium'} span={4}>
                Refferal point
              </Col>
            </Row>
            <div className={'min-h-[400px]'}>
              {isFetching && (
                <>
                  {Array.from(new Array(10)).map((_, index) => {
                    return (
                      <Row key={index} className={'border-t border-[#F2F4F7] p-4'}>
                        <Col span={2}>
                          <div>
                            <Skeleton.Button active />
                          </div>
                        </Col>
                        <Col span={18}>
                          <Skeleton.Button className={'min-w-[550px]'} />
                        </Col>
                        <Col span={4}>
                          <Skeleton.Button />
                        </Col>
                      </Row>
                    )
                  })}
                </>
              )}
              {items.length > 0 && !isFetching && (
                <>
                  {items.map((item: any, index: number) => {
                    return (
                      <Row key={index} className={'border-t border-[#F2F4F7] p-4'}>
                        <Col span={2}>{item.no}</Col>
                        <Col span={18}>
                          <div className={'flex text-[#53389E] items-center gap-2'}>
                            <div>{ellipseAddress(item.address, 5)}</div>
                            <Tooltip title={copyText}>
                              <div onClick={() => handleCopy(item.address)} className={'cursor-pointer'}>
                                <CopyIcon />
                              </div>
                            </Tooltip>
                          </div>
                        </Col>
                        <Col span={4}>{formatNumberBalance(item.point, 0)}</Col>
                      </Row>
                    )
                  })}
                </>
              )}
              {items.length === 0 && !isFetching && (
                <div className={'flex justify-center items-center h-[400px]'}>
                  <span>No data</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {items.length > 0 && (
          <div className={'mt-6 flex justify-center items-center p-4'}>
            <Pagination showSizeChanger={false} onChange={onChange} current={page} total={totalItems} />
          </div>
        )}
      </div>
    </>
  )
}
