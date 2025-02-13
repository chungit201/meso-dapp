import { useAssets } from '@/common/hooks/assets/useAssets';
import { formatNumberBalance } from '@/utils';
import { Typography } from 'antd';
import React from 'react';
import { isMobile } from 'react-device-detect';

const rickFactorProgressDesktop = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
const rickFactorProgressMobile = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

interface Props {
  width?: number;
  height?: number;
}

export const RiskFactorProgress: React.FunctionComponent<Props> = ({ width = 4, height = 22 }) => {
  const { riskFactor } = useAssets();

  const rickFactorProgress = isMobile ? rickFactorProgressMobile : rickFactorProgressDesktop;

  const progressBackground =
    riskFactor < 80 ? 'active-progress' : riskFactor > 90 ? 'rick-factor-error' : 'rick-factor-warning';

  const progressColor = riskFactor < 80 ? '#7F56D9' : riskFactor > 90 ? '#F04438' : riskFactor > 80 ? '#DC6803' : '';

  return (
    <div>
      <div>
        <Typography className={'font-medium text-[#5D6B98]'}>Risk Factor</Typography>
        <div className={'flex items-center gap-3 mt-2'}>
          <span style={{ color: progressColor }} className={' text-base sm:text-xl font-semibold'}>
            {formatNumberBalance(riskFactor, 2)}%
          </span>
          <div className={'flex gap-[3px]'}>
            {rickFactorProgress.map((item, index) => {
              return (
                <div
                  key={index}
                  style={{
                    width: `${width}px`,
                    height: `${height}px`,
                  }}
                  className={`${item <= Number(riskFactor) && progressBackground} bg-[#DCDFEA] rounded-[2px]`}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
