import { UtilizationChart } from '@/common/components/Views/asset/UtilizationChart';
import { MAX_BPS } from '@/common/consts';
import { formatNumberBalance } from '@/utils';
import { getBorrowRate } from '@/utils/assets';
import { Card, Typography } from 'antd';
import React, { useMemo } from 'react';

interface Props {
  asset: PoolAsset;
}

export const InterestRate: React.FunctionComponent<Props> = ({ asset }) => {
  const data = useMemo(() => {
    const chartData = [];
    const current_utilization = asset.totalDebt / asset.poolSupply;
    const optimal_utilization = [0, asset.optimalUtilizationBps / MAX_BPS, 1];
    optimal_utilization.splice(
      asset.optimalUtilizationBps / MAX_BPS < current_utilization ? 2 : 1,
      0,
      current_utilization,
    );

    const utilizationData = [];
    let range = 0;
    for (let i = 0; i < 200; i++) {
      utilizationData.push((range += 0.5));
    }
    utilizationData.push(current_utilization * 100);
    for (const num of utilizationData) {
      chartData.push({
        utilization: num,
        borrowRate: (getBorrowRate(num / 100, asset) / MAX_BPS) * 100,
      });
    }

    return chartData.sort((a, b) => a.utilization - b.utilization);
  }, [asset]);

  return (
    <div className={'border border-[#EFF1F5] bg-[#F9F9FB] rounded-[28px] p-2 sm:p-3'}>
      <Card bordered={false} className="bg-[#FFF] border border-[#EFF1F5] card-shadow2 p-3 sm:p-5 rounded-[24px]">
        <div>
          <Typography className="text-lg font-semibold">Interest Rate Model</Typography>
          <div className="mt-4 text-[#515D86] text-base">Utilization rate</div>
          <div className="text-2xl font-bold mt-2">
            {asset.poolSupply > 0 ? Number((asset.totalDebt / asset.poolSupply) * 100).toFixed(2) : '0.00'}%
          </div>
          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-[12px] h-[12px] bg-[#714DD9] rounded-full"></div>
              <div>Variable borrow APR</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-[12px] h-[12px] bg-[#2458F6] rounded-full"></div>
              <div>Utilization</div>
            </div>
          </div>
          <UtilizationChart data={data} asset={asset} currentUtilization={asset.totalDebt / asset.poolSupply} />
          <div className="rounded-[12px] mt-5">
            <div className="p-5 border-b flex items-center justify-between border-[#1A2A3B] border-opacity-10">
              <Typography className="text-base">Optimal Utilization</Typography>
              <Typography className="text-base font-bold">
                {formatNumberBalance((asset.optimalUtilizationBps / MAX_BPS) * 100, 2)}%
              </Typography>
            </div>
            <div className="p-5 flex items-center justify-between border-b border-[#1A2A3B] border-opacity-10">
              <Typography className="text-base">Optimal Interest Rate</Typography>
              <Typography className="text-base font-bold">
                {formatNumberBalance((asset.optimalBps / MAX_BPS) * 100, 2)}%
              </Typography>
            </div>
            <div className="p-5 flex items-center justify-between">
              <Typography className="text-base">Max Interest Rate</Typography>
              <Typography className="text-base font-bold">{(asset.maxBps / MAX_BPS) * 100}%</Typography>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
