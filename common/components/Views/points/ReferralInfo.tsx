import { InviteIcon, StarVector } from '@/common/components/Icons';
import { TableReferral } from '@/common/components/Views/points/TableReferral';
import { formatNumberBalance } from '@/utils';
import { Card, Col, Row } from 'antd';
import React from 'react';

interface Props {
  userInfo: any;
}

export const ReferralInfo: React.FunctionComponent<Props> = ({ userInfo }) => {
  return (
    <div className={'mt-24 pb-20'}>
      <h3 className={'text-2xl font-semibold'}>Referral</h3>
      <Row gutter={[16, 16]} className={'mt-8'}>
        <Col xs={24} xl={12}>
          <Card bordered={false} className={'p-5 border border-[#E4E7EC] rounded-[16px]'}>
            <div className={'flex items-center gap-6'}>
              <div className={'w-[56px] h-[56px] bg-[#FCE7F6] rounded-full flex justify-center items-center'}>
                <InviteIcon />
              </div>
              <div>
                <div className={'text-xl font-medium'}>{userInfo ? userInfo.totalInvited : '-'}</div>
                <div className={'text-[#667085]'}>Total invited</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card bordered={false} className={'p-5 border border-[#E4E7EC] rounded-[16px]'}>
            <div className={'flex items-center gap-6'}>
              <div className={'w-[56px] h-[56px] bg-[#D1E9FF] rounded-full flex justify-center items-center'}>
                <StarVector />
              </div>
              <div>
                <div className={'text-xl font-medium'}>
                  {userInfo ? formatNumberBalance(userInfo.referralPoint) : '-'}
                </div>
                <div className={'text-[#667085]'}>Referral point</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      <TableReferral />
    </div>
  );
};
