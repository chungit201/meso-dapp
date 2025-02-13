import { Col, Row, Skeleton } from 'antd';
import React from 'react';

export const AssetsLoadingMobile: React.FunctionComponent = () => {
  return (
    <div className={'mt-4 block sm:hidden border border-[#DCDFEA] rounded-[16px]'}>
      <Row className={'px-[12px] py-4 pr-[40px] text-[#5D6B98] font-medium border-[#DCDFEA] border-b'}>
        <Col span={8}>Asset Name</Col>
        <Col span={8} className={'text-center'}>
          LTV
        </Col>
        <Col span={8}>Supply APR</Col>
      </Row>
      <div className={'flex flex-col gap-3 p-3'}>
        {Array.from({ length: 10 }).map((_, index) => (
          <Row key={index} gutter={[8, 8]} className="">
            <Col span={8}>
              <div className={'flex gap-3 items-center'}>
                <Skeleton.Avatar className={'w-[25px]'} active />
                <Skeleton.Button className={'flex-1'} size={'small'} active />
              </div>
            </Col>
            <Col className={'flex items-center'} span={8}>
              <Skeleton.Button className={'w-full'} size={'small'} active />
            </Col>
            <Col className={'flex items-center'} span={8}>
              <Skeleton.Button className={'w-full'} size={'small'} active />
            </Col>
          </Row>
        ))}
      </div>
    </div>
  );
};
