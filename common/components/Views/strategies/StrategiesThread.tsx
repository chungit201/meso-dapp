import React from 'react'
import { Col, Row } from 'antd'

export const StrategiesThread: React.FunctionComponent = () => {
  return (
    <Row className={' border-b border-[#E4E7EC] text-[#667085] font-medium'}>
      <Col className={'p-5 strategies-item'} span={5}>
        <div className={'text-sm'}>Strategies</div>
      </Col>
      <Col className={'p-5 strategies-item'} span={2}>
        <div className={'text-sm'}>Type</div>
      </Col>
      <Col className={'p-5 strategies-item'} span={2}>
        <div className={'text-sm'}>Max APR</div>
      </Col>
      <Col className={'p-5 strategies-item'} span={3}>
        <div className={'text-sm'}>Liquidity Available</div>
      </Col>
      <Col className={'p-5 strategies-item'} span={3}>
        <div className={'text-sm'}>Net APR</div>
      </Col>
      <Col className={'p-5 strategies-item'} span={3}>
        <div className={'text-sm'}>Total Supplied </div>
      </Col>
      <Col className={'p-5 strategies-item'} span={3}>
        <div className={'text-sm'}>Total Borrowed</div>
      </Col>
      <Col className={'p-5 strategies-item'} span={3}></Col>
    </Row>
  )
}
