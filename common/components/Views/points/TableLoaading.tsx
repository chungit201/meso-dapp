import { Col, Row, Skeleton } from 'antd';
import React from 'react';

export const TableLoading: React.FunctionComponent = () => {
  return (
    <>
      {Array.from(new Array(10)).map((item) => {
        return (
          <Row key={item} className={'h-[54.67px] px-3 flex items-center text-[#1A2A3B] border-t border-[#DBE6F6]'}>
            <Col span={2} className={'text-center flex justify-center'}>
              <Skeleton.Avatar className={'w-[10px] h-8 '} active />
            </Col>
            <Col span={16} className={'text-[#2458F6] flex justify-start px-4'}>
              <Skeleton.Button className={'w-full h-8'} active />
            </Col>
            <Col span={6} className={'text-[#1A2A3B] flex justify-center'}>
              <Skeleton.Button className={'w-full max-w-[150px]  h-8'} active />
            </Col>
          </Row>
        );
      })}
    </>
  );
};
