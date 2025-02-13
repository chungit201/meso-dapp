import { RiskFactorProgress } from '@/common/components/Views/dashboard/RiskFactorProgress';
import { MESO_ADDRESS } from '@/common/consts';
import { AssetsContext } from '@/common/context';
import { useRewards } from '@/common/hooks/assets/useRewards';
import useTransactionCallback from '@/common/hooks/assets/useTransactionCallback';
import { useDashboard } from '@/common/hooks/dashboard/useDashboard';
import { formatNumberBalance } from '@/utils';
import { Button, Col, Row } from 'antd';
import React, { useContext, useState } from 'react';

export const AccountDashboard: React.FunctionComponent = () => {
  const [loading, setLoading] = useState(false);
  const { netBalance, netApr } = useDashboard();
  const { allAssetsData } = useContext(AssetsContext);
  const { totalRewards, refetchRewardPool } = useRewards();

  const transactionCallback = useTransactionCallback();

  const handleClaim = () => {
    try {
      const pools = [];
      for (const item of allAssetsData) {
        pools.push(item.token.address);
      }
      transactionCallback({
        payload: {
          function: `${MESO_ADDRESS}::meso::claim_all_apt_rewards`,
          typeArguments: [],
          functionArguments: [pools as any],
        },
        onSuccess(hash: string) {
          console.log('hash', hash);
          refetchRewardPool();
        },
        setLoading,
      });
    } catch (e) {
      console.log('e', e);
    }
  };

  return (
    <Col className={'h-full'} xs={24} sm={24} xl={24}>
      <div
        style={{
          background:
            'linear-gradient(105.88deg, rgba(82, 100, 255, 0.1) -2.36%, rgba(9, 107, 255, 0.1) 38.79%, rgba(43, 9, 255, 0.1) 98.22%)',
        }}
        className={'rounded-[12px] p-5 dashboard-shadow'}
      >
        <Row gutter={[18, 18]}>
          <Col xs={12} sm={12} xl={6}>
            <div>
              <RiskFactorProgress />
            </div>
          </Col>
          <Col className={'text-start md:text-center'} xs={12} sm={12} xl={6}>
            <div className={'font-medium text-[#5D6B98]'}>Net Worth</div>
            <div className={'text-[#4A5578] font-semibold text-lg mt-2'}>${formatNumberBalance(netBalance, 2)}</div>
          </Col>
          <Col className={'text-start md:text-center'} xs={12} sm={12} xl={6}>
            <div className={'font-medium text-[#5D6B98]'}>Net APR</div>
            <div className={'text-gradient font-semibold text-lg mt-2'}>{formatNumberBalance(netApr, 4)}%</div>
          </Col>
          <Col className={'text-start md:text-center'} xs={12} sm={12} xl={6}>
            <div className={'font-medium text-[#5D6B98]'}>Total Rewards</div>
            <Button
              loading={loading}
              className={
                'bg-transparent text-xs sm:text-sm border-[#7F56D9] font-medium h-8 sm:h-9 text-[#7F56D9] mt-2 rounded-full'
              }
              onClick={handleClaim}
            >
              Claim {formatNumberBalance(totalRewards, 4)} APT
            </Button>
          </Col>
        </Row>
      </div>
    </Col>
  );
};
