import { WalletIcon } from '@/common/components/Icons';
import { ManageAssetMode, ModalManageAssets } from '@/common/components/Modals/ModalManageAssets';
import { MESO_ADDRESS } from '@/common/consts';
import AssetContextProvider from '@/common/context/AssetContextProvider';
import useContract from '@/common/hooks/useContract';
import appActions from '@/modules/app/actions';
import { formatNumberBalance } from '@/utils';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Typography } from 'antd';
import BigNumber from 'bignumber.js';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface Props {
  asset: PoolAsset;
}

export const YourInfo: React.FunctionComponent<Props> = ({ asset }) => {
  const [mode, setMode] = useState<ManageAssetMode>(ManageAssetMode.Supply);
  const { view } = useContract();
  const { account } = useWallet();
  const dispatch = useDispatch();
  const app = useSelector((state: any) => state.app);

  const handleClose = () => {
    dispatch(appActions.SET_MANAGE_ASSETS(false));
  };

  const { data: totalBorrowAvailable = 0, refetch: refetchBorrowAmount } = useQuery({
    queryKey: ['calculateBorrowAsset', asset],
    queryFn: async () => {
      const res: any = await view({
        function: `${MESO_ADDRESS}::lending_pool::max_borrowable_amount`,
        typeArguments: [],
        functionArguments: [account?.address, asset.poolAddress],
      });
      const maxBorrow = BigNumber(Number(res[0])).div(BigNumber(10).pow(asset.token.decimals)).toNumber();
      const totalBorrowAvailableInPool = BigNumber(asset.borrowCap - asset.totalDebt)
        .div(BigNumber(10).pow(asset.token.decimals))
        .toNumber();
      const borrowAvailable = maxBorrow > totalBorrowAvailableInPool ? totalBorrowAvailableInPool : maxBorrow;
      return borrowAvailable < 0 ? 0 : borrowAvailable;
    },
    enabled: !!asset && !!account?.address,
  });

  return (
    <Card bordered={false} className={'bg-[#FFF] border border-[#EFF1F5] p-4 sm:p-5 rounded-[12px] card-shadow2'}>
      <Typography className={'text-[#1A2A3B] text-xl font-bold'}>Your info</Typography>
      <div className={'flex asset-info-box p-4 items-center gap-3 mt-4'}>
        <div className={'w-[65px] flex justify-center items-center h-[65px] bg-[#fff] rounded-[12px]'}>
          <WalletIcon />
        </div>
        <div>
          <Typography className={'text-[#5D6B98] font-medium'}>Wallet balance</Typography>
          <span className={'text-lg font-bold'}>
            {formatNumberBalance(asset.walletBalance, 4)} {asset.token.symbol}
          </span>
        </div>
      </div>
      <div className={'mt-5'}>
        <Typography className={'text-[#5D6B98] font-medium'}>Available to supply</Typography>
        <div className={'flex justify-between items-center mt-3'}>
          <div className={''}>
            <div className={'text-lg text-[#30374F] font-bold'}>{formatNumberBalance(asset.walletBalance, 4)}</div>
            <div className={'text-[#7A88B4] font-medium'}>
              ${formatNumberBalance(asset.walletBalance * asset.token.price, 2)}
            </div>
          </div>
          <Button
            className={'bg-transparent border-[#7F56D9] rounded-full text-[#7F56D9]'}
            onClick={() => {
              dispatch(appActions.SET_MANAGE_ASSETS(true));
              setMode(ManageAssetMode.Supply);
            }}
          >
            Supply
          </Button>
        </div>
      </div>
      <div className={'mt-4'}>
        <Typography className={'text-[#5D6B98] font-medium'}>Available to borrow</Typography>
        <div className={'flex justify-between items-center mt-3'}>
          <div>
            <div className={'text-lg font-bold text-[#30374F]'}>{formatNumberBalance(totalBorrowAvailable, 4)}</div>
            <div className={'text-[#7A88B4] font-medium'}>
              ${formatNumberBalance(totalBorrowAvailable * asset.token.price, 2)}
            </div>
          </div>
          <Button
            className={'bg-transparent border-[#7F56D9] rounded-full text-[#7F56D9]'}
            onClick={() => {
              dispatch(appActions.SET_MANAGE_ASSETS(true));
              setMode(ManageAssetMode.Borrow);
            }}
          >
            Borrow
          </Button>
        </div>
      </div>
      {app.showModalManageAssets && (
        <AssetContextProvider>
          <ModalManageAssets
            mode={mode}
            setMode={setMode}
            isModalOpen={app.showModalManageAssets}
            handleClose={handleClose}
            asset={asset}
          />
        </AssetContextProvider>
      )}
    </Card>
  );
};
