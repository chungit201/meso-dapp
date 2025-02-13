import { BoostIcon } from '@/common/components/Icons';
import { Popover } from 'antd';
import React from 'react';

interface Props {
  asset: PoolAsset;
}

export const PoolBorrowApr: React.FunctionComponent<Props> = ({ asset }) => {
  return (
    <Popover
      overlayClassName={'popover-incentives'}
      trigger={asset.incentiveBorrowApy ? ['hover', 'click'] : []}
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
            <div className={'text-[#5D6B98] font-medium'}> Borrow APR</div>
            <span className={'text-[#815BFE] font-semibold'}>{asset.borrowApy.toFixed(2)}%</span>
          </div>
          <div className={'flex justify-between items-center mt-3'}>
            <div className={'flex items-center gap-2'}>
              <img className={'w-[15px] h-auto'} src={`https://image.meso.finance/apt.png`} alt={''} />
              <span className={'text-[#099250] font-medium'}>APT incentive APR</span>
            </div>
            <span className={'text-[#815BFE] font-semibold'}>{asset.incentiveBorrowApy.toFixed(2)}%</span>
          </div>
          <div className={'w-full border-b border-dashed border-[#E8EBF6] my-3'}></div>
          <div className={'flex justify-between items-center'}>
            <div className={'text-[#5D6B98] font-medium'}> Combined APR</div>
            <span className={'text-[#099250] font-semibold'}>
              {Number(asset.borrowApy - asset.incentiveBorrowApy).toFixed(2)}%
            </span>
          </div>
        </div>
      }
    >
      <div className={'flex items-center cursor-pointer gap-1'}>
        {asset.incentiveBorrowApy > 0 && (
          <div>
            <BoostIcon />
          </div>
        )}
        <span className={'text-[#FF4D4F] text-sm border-b border-dashed border-[#DCDFEA] font-medium'}>
          {asset.incentiveBorrowApy
            ? Number(asset.borrowApy + -asset.incentiveBorrowApy).toFixed(2)
            : Number(asset.borrowApy).toFixed(2)}
          %
        </span>
      </div>
    </Popover>
  );
};
