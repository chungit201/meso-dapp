import { BoostIcon } from '@/common/components/Icons';
import { formatNumberBalance } from '@/utils';
import { Popover } from 'antd';
import React from 'react';

interface Props {
  asset: PoolAsset;
}

export const PoolSupplyApr: React.FunctionComponent<Props> = ({ asset }) => {
  return (
    <Popover
      overlayClassName={'popover-incentives'}
      trigger={asset.incentiveSupplyApy || asset.stakingApr ? ['hover', 'click'] : []}
      content={
        <div className={'p-3 max-w-[260px]'}>
          <div className={'flex gap-2 items-start'}>
            <div>
              <BoostIcon />
            </div>
            <p className={'text-[#4A5578] font-medium'}>This supply offers higher APR and additional rewards</p>
          </div>

          <div className={'w-full border-b border-dashed border-[#E8EBF6] my-3'}></div>
          <div className={'flex justify-between items-center'}>
            <div className={'text-[#5D6B98] font-medium'}> Supply APR</div>
            <span className={'text-[#099250] font-semibold'}>{asset.supplyApy.toFixed(2)}%</span>
          </div>
          <div className={'flex justify-between items-center mt-2'}>
            <div className={'text-[#5D6B98] font-medium'}> Staking APR</div>
            <span className={'text-[#099250] font-semibold'}>{formatNumberBalance(asset.stakingApr)}%</span>
          </div>
          <div className={'flex justify-between items-center mt-3'}>
            <div className={'flex items-center gap-2'}>
              <img className={'w-[15px] h-auto'} src={`https://image.meso.finance/apt.png`} alt={''} />
              <span className={'text-[#5D6B98] font-medium'}>APT incentive APR</span>
            </div>
            <span className={'text-[#099250] font-semibold'}>{asset.incentiveSupplyApy.toFixed(2)}%</span>
          </div>
          <div className={'w-full border-b border-dashed border-[#E8EBF6] my-3'}></div>
          <div className={'flex justify-between items-center'}>
            <div className={'text-[#5D6B98] font-medium'}> Combined APR</div>
            <span className={'text-[#099250] font-semibold'}>
              {Number(asset.supplyApy + asset.stakingApr + asset.incentiveSupplyApy).toFixed(2)}%
            </span>
          </div>
        </div>
      }
    >
      <div className={'flex cursor-pointer items-center gap-1'}>
        {(asset.incentiveSupplyApy > 0 || asset.stakingApr > 0) && (
          <div>
            <BoostIcon />
          </div>
        )}
        <span className={'text-[#099250] text-sm border-b border-dashed border-[#DCDFEA] font-medium text-base'}>
          {asset.incentiveSupplyApy
            ? (asset.supplyApy + asset.incentiveSupplyApy + asset.stakingApr).toFixed(2)
            : Number(asset.supplyApy + asset.stakingApr).toFixed(2)}
          %
        </span>
      </div>
    </Popover>
  );
};
