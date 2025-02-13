import React, { useMemo } from 'react'
import { Card, Col, Row } from 'antd'
import { BorrowingPowerProgress } from '@/common/components/Views/dashboard/BorrowingPowerProgress'
import { formatNumberBalance, nFormatter } from '@/utils'
import { useAssets } from '@/common/hooks/assets/useAssets'
import { useDashboard } from '@/common/hooks/dashboard/useDashboard'
import { useWallet } from '@aptos-labs/wallet-adapter-react'

export const UserDashBoard: React.FunctionComponent = () => {
  const { riskFactor, assetDebts, assetDeposits } = useAssets()
  const { borrowPower } = useDashboard()
  const { connected } = useWallet()
  const totalSupply = useMemo(() => {
    let total = 0
    for (const item of assetDeposits) {
      total += item.amountDeposit * item?.token?.price
    }
    return total
  }, [assetDeposits])

  const totalBorrowed = useMemo(() => {
    let total = 0
    for (const item of assetDebts) {
      total += item.debtAmount * item?.token?.price
    }
    return total
  }, [assetDebts])

  const progressColor = riskFactor < 80 ? '#7F56D9' : riskFactor > 90 ? '#F04438' : riskFactor > 80 ? '#DC6803' : ''

  return (
    <Card
      bordered={false}
      className={'bg-[#FFFFFF] card-shadow min-h-[106px] p-6 rounded-[16px] mt-6 border border-[#EFF1F5]'}
    >
      <Row>
        <Col xs={24} sm={6} xl={6}>
          <BorrowingPowerProgress borrowPower={Number(borrowPower)} />
        </Col>
        <Col className={'text-start sm:text-center'} xs={8} sm={6} xl={6}>
          <div className={'text-[#5D6B98] font-medium text-[10px] sm:text-sm'}>Risk Factor</div>
          {connected ? (
            <div style={{ color: progressColor }} className={' font-semibold tex-sm sm:text-lg mt-2'}>
              {formatNumberBalance(riskFactor, 2)}%
            </div>
          ) : (
            <span className={'text-xl mt-2'}>--</span>
          )}
        </Col>
        <Col className={'text-start sm:text-center'} xs={8} sm={6} xl={6}>
          <div className={'text-[#5D6B98] font-medium text-[10px] sm:text-sm'}>Supplied Amount</div>
          {connected ? (
            <div className={'text-[#4A5578] font-semibold tex-sm sm:text-lg mt-2'}>${nFormatter(totalSupply)}</div>
          ) : (
            <span className={'text-xl mt-2'}>--</span>
          )}
        </Col>
        <Col className={'text-start sm:text-center'} xs={8} sm={6} xl={6}>
          <div className={'text-[#5D6B98] font-medium text-[10px] sm:text-sm'}>Borrowed Amount</div>
          {connected ? (
            <div className={'text-[#4A5578] font-semibold tex-sm sm:text-lg mt-2'}>${nFormatter(totalBorrowed)}</div>
          ) : (
            <span className={'text-xl mt-2'}>--</span>
          )}
        </Col>
      </Row>
    </Card>
  )
}
