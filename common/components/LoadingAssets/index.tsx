import { Col, Row, Skeleton } from 'antd';
import React from 'react';

export const LoadingAssets: React.FunctionComponent = () => {
  return (
    <>
      {Array.from(new Array(5)).map((item) => {
        return (
          <Row
            key={item}
            className={
              'justify-between items-start bg-[#F9F9FB] hidden sm:flex px-4 py-3 border-b border-t border-[#DCDFEA]'
            }
          >
            <Col span={6} className={'items-center text-[#62758A] font-medium'}>
              <div className={'flex items-center gap-2'}>
                <Skeleton.Avatar active />
                <Skeleton.Button className={'w-[100px] h-6'} active />
              </div>
            </Col>
            <Col span={6} className={'min-w-[100px] text-end flex-1 text-[#62758A] font-medium'}>
              <Skeleton.Button className={'w-[100px] h-6'} active />
            </Col>
            <Col span={6} className={'min-w-[100px] flex-1 text-end text-[#62758A] font-medium'}>
              <Skeleton.Button className={'w-[100px] h-6'} active />
            </Col>
            <Col xs={24} sm={6} xl={6} className={'flex items-center justify-end text-end gap-2'}>
              <Skeleton.Button className={'w-[100px] h-6'} active />
            </Col>
          </Row>
        );
      })}
    </>
  );
};
