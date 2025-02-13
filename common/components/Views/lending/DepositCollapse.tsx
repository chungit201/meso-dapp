import { ManageAssetMode, ModalManageAssets } from '@/common/components/Modals/ModalManageAssets';
import { useAssets } from '@/common/hooks/assets/useAssets';
import { useModal } from '@/common/hooks/useModal';
import { formatNumberBalance } from '@/utils';
import { Card, Col, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

export const DepositCollapse: React.FunctionComponent = () => {
  const [totalBalance, setTotalBalance] = useState(0);
  const { assetDeposits } = useAssets();
  const { show, setShow, toggle } = useModal();
  const [asset, setAsset] = useState<PoolAsset | null>(null);

  useEffect(() => {
    let total = 0;
    for (const item of assetDeposits) {
      total += item.amountDeposit * (item?.token?.price ?? 0);
    }
    setTotalBalance(total);
  }, [assetDeposits]);

  return (
    <Col xs={24} xl={8}>
      <Card className={'border-[#F3F5F8] rounded-[12px]'}>
        <div
          className={
            'bg-[#F3F5F8] flex justify-between items-center text-lg p-3 rounded-tl-[12px] min-h-[56px] rounded-tr-[12px]'
          }
        >
          <Typography>Deposit</Typography>
          <Typography>${formatNumberBalance(totalBalance, 2)}</Typography>
        </div>
        <div className={'min-h-[150px] overflow-y-auto'}>
          {assetDeposits.map((item, index) => {
            return (
              <div
                onClick={() => {
                  setAsset(item);
                  setShow(true);
                }}
                className={
                  'p-3 asset-row cursor-pointer hover:bg-[#F3F5F8] hover:bg-opacity-30 flex justify-between border-b border-b-[#F3F5F8]'
                }
                key={index}
              >
                <div className={'flex items-center gap-2'}>
                  <img
                    className={'w-[25px] h-auto'}
                    src={`https://image.meso.finance/${item.token?.symbol.toLowerCase()}.png`}
                    alt={''}
                  />
                  <Typography className={'text-base'}>{item?.token?.symbol}</Typography>
                </div>
                <Typography>${formatNumberBalance(item.amountDeposit * item?.token?.price, 2)}</Typography>
              </div>
            );
          })}
        </div>
      </Card>
      <ModalManageAssets mode={ManageAssetMode.Supply} isModalOpen={!!show} handleClose={toggle} asset={asset!} />
    </Col>
  );
};
