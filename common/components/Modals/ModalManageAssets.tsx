import { CloseIcon } from '@/common/components/Icons';
import { AssetMoreInformation } from '@/common/components/Views/asset/AssetMoreInformation';
import { AssetRowType } from '@/common/components/Views/dashboard/YourSupplies';
import { Borrow } from '@/common/components/Views/lending/manage/Borrow';
import { Deposit } from '@/common/components/Views/lending/manage/Deposit';
import { Withdraw } from '@/common/components/Views/lending/manage/Withdraw';
import useBalanceToken from '@/common/hooks/useBalanceToken';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { Divider, Modal, Tabs, Typography } from 'antd';
import BigNumber from 'bignumber.js';
import React, { useEffect, useState } from 'react';
import { Repay } from '../Views/lending/manage/Repay';

export enum ManageAssetMode {
  Supply = 'Supply',
  Withdraw = 'Withdraw',
  Borrow = 'Borrow',
  Repay = 'Repay',
}

interface Props {
  isModalOpen: boolean;
  handleClose: () => void;
  asset: PoolAsset;
  mode?: ManageAssetMode | AssetRowType;
  setMode?: (mode: ManageAssetMode) => void;
  refetch?: () => void;
}

export const ModalManageAssets: React.FunctionComponent<Props> = ({
  isModalOpen,
  handleClose,
  asset,
  mode,
  setMode,
  refetch: refetchOuter,
}) => {
  const [assetSelected, setAssetSelected] = useState<PoolAsset>(asset);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const { getBalanceCoin } = useBalanceToken();
  const { account } = useWallet();

  useEffect(() => {
    setAssetSelected(asset);
  }, [asset]);

  const { data: balanceAsset = 0, refetch } = useQuery({
    queryKey: ['getBalanceAssets', asset, account, assetSelected],
    queryFn: async () => {
      const balance = await getBalanceCoin(assetSelected.token, account?.address as string);
      return BigNumber(balance)
        .div(BigNumber(10).pow(assetSelected.token.decimals ?? 8))
        .toNumber();
    },
    enabled: !!asset && !!account,
    refetchIntervalInBackground: true,
    refetchOnReconnect: 'always',
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
  });

  const handleChange = (value: string) => {
    setMode?.(value as any);
  };

  const retchData = async () => {
    refetchOuter?.();
    await refetch();
  };

  return (
    <Modal
      centered
      onCancel={() => {
        handleClose();
      }}
      open={isModalOpen}
      footer={false}
      closable={false}
      title={
        <div className={'flex items-center justify-between gap-3'}>
          <Typography className={'text-[#191D21] flex gap-1 text-lg'}>
            {mode === ManageAssetMode.Supply && 'Supply'}
            {mode === ManageAssetMode.Borrow && 'Borrow'}
            {mode === ManageAssetMode.Repay && 'Repay'}
            {mode === ManageAssetMode.Withdraw && 'Withdraw'}
            <span>{assetSelected?.token?.name}</span>
          </Typography>
          <div className={'flex items-center gap-2'}>
            <div onClick={handleClose} className={'cursor-pointer'}>
              <CloseIcon />
            </div>
          </div>
        </div>
      }
      width={483}
    >
      {assetSelected && (
        <div className={'px-5 pb-5 max-h-[650px] overflow-y-auto'}>
          <Tabs className={'manage-tabs'} onChange={handleChange} activeKey={mode} defaultActiveKey={mode}>
            <Tabs.TabPane animated={false} tab={ManageAssetMode.Supply} key={ManageAssetMode.Supply.toString()}>
              <Deposit
                asset={assetSelected!}
                setAssetSelected={setAssetSelected}
                handleClose={handleClose}
                balance={balanceAsset}
                refetch={retchData}
              />
            </Tabs.TabPane>
            <Tabs.TabPane animated={false} tab={ManageAssetMode.Withdraw} key={ManageAssetMode.Withdraw.toString()}>
              <Withdraw
                asset={assetSelected!}
                setAssetSelected={setAssetSelected}
                handleClose={handleClose}
                balance={balanceAsset}
                refetch={retchData}
              />
            </Tabs.TabPane>
            <Tabs.TabPane animated={false} tab={ManageAssetMode.Borrow} key={ManageAssetMode.Borrow.toString()}>
              <Borrow
                asset={assetSelected!}
                setAssetSelected={setAssetSelected}
                handleClose={handleClose}
                balance={balanceAsset}
                refetch={retchData}
              />
            </Tabs.TabPane>
            <Tabs.TabPane animated={false} tab={ManageAssetMode.Repay} key={ManageAssetMode.Repay.toString()}>
              <Repay
                asset={assetSelected!}
                setAssetSelected={setAssetSelected}
                handleClose={handleClose}
                balance={balanceAsset}
                refetch={retchData}
              />
            </Tabs.TabPane>
          </Tabs>
          <Divider>
            <span
              onClick={() => setShowMoreInfo(!showMoreInfo)}
              className={'text-[#7F56D9] cursor-pointer flex items-center gap-2'}
            >
              More Info{' '}
              <i
                className={`${
                  showMoreInfo ? 'expanded-array' : ''
                } fa-solid fa-chevron-down text-sm mt-1 transition-delay`}
              ></i>
            </span>
          </Divider>
          {showMoreInfo && asset && <AssetMoreInformation asset={asset} />}
        </div>
      )}
    </Modal>
  );
};
