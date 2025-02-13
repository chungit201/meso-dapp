import { WalletIcon } from '@/common/components/Icons';
import { BannerPage } from '@/common/components/Layout/BannerPage';
import { ModalConnectWallet } from '@/common/components/Modals/ModalConnectWallet';
import { ManageAssetMode, ModalManageAssets } from '@/common/components/Modals/ModalManageAssets';
import { ModalTetherLive } from '@/common/components/Modals/ModalTetherLive';
import { AccountDashboard } from '@/common/components/Views/dashboard/AccountDashboard';
import { AssetsBorrow } from '@/common/components/Views/dashboard/AssetsBorrow';
import { AssetsSupply } from '@/common/components/Views/dashboard/AssetsSupply';
import { YourBorrows } from '@/common/components/Views/dashboard/YourBorrows';
import { AssetRowType, YourSupplies } from '@/common/components/Views/dashboard/YourSupplies';
import { IsolateDashboard } from '@/common/components/Views/isolate/IsolateDashboard';
import AssetContextProvider from '@/common/context/AssetContextProvider';
import { getData } from '@/common/hooks/useLocalStoragre';
import { useModal } from '@/common/hooks/useModal';
import { getDiff, isAddress, setHiddenTimePopupTether } from '@/utils';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button, Card, Row } from 'antd';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useState } from 'react';

const Page: React.FunctionComponent = () => {
  const { connected, account } = useWallet();
  const [assetSelected, setAssetSelected] = useState<PoolAsset | null>(null);
  const [mode, setMode] = useState<ManageAssetMode | AssetRowType>(ManageAssetMode.Supply);
  const { show, setShow, toggle } = useModal();
  const { show: showTether, setShow: setShowTether, toggle: toggleTether } = useModal();

  const closePopupTether = () => {
    toggleTether();
    setHiddenTimePopupTether();
  };

  useEffect(() => {
    const time = Number(getData('hiddePopupTether'));
    if (getDiff(time * 1000) < 0) {
      setShowTether(true);
    }
  }, []);

  const router = useRouter();

  const walletAddress = useMemo(
    () =>
      router.query.view_address && isAddress(router.query.view_address as string)
        ? router.query.view_address
        : account?.address,
    [account, router],
  );

  const handleClose = () => {
    setAssetSelected(null);
  };

  return (
    <AssetContextProvider>
      <BannerPage />
      {walletAddress && (
        <div>
          <div className={'container max-w-[1536px] -mt-20 mx-auto pb-40 px-3'}>
            <Card className={'bg-[#FFFFFF] card-shadow p-3 sm:p-6 rounded-[16px] border-[#EFF1F5]'}>
              <AccountDashboard />
              <Row gutter={[24, 24]} className={'mt-5'}>
                <YourSupplies setAssetSelected={setAssetSelected} setMode={setMode} />
                <YourBorrows setAssetSelected={setAssetSelected} setMode={setMode} />
              </Row>
            </Card>
            <Card className={'bg-[#FFFFFF] card-shadow p-3 sm:p-6 rounded-[16px] border-[#EFF1F5] mt-8'}>
              <Row gutter={[24, 24]}>
                <AssetsSupply setAssetSelected={setAssetSelected} setMode={setMode} />
                <AssetsBorrow setAssetSelected={setAssetSelected} setMode={setMode} />
              </Row>
            </Card>
            {assetSelected && (
              <ModalManageAssets
                mode={mode}
                setMode={setMode}
                isModalOpen={!!assetSelected}
                handleClose={handleClose}
                asset={assetSelected!}
              />
            )}
          </div>
          <IsolateDashboard />
        </div>
      )}

      {!walletAddress && (
        <div className={'text-center min-h-[75vh] flex justify-center items-center px-3'}>
          <div>
            <div className={'flex justify-center'}>
              <WalletIcon className={'w-[120px] h-auto'} />
            </div>
            <div className={'mt-5 text-[#101828] text-xl font-semibold'}>Please connect your wallet</div>
            <p className={'text-[#4A5578] mt-4'}>
              Connect your compatible wallet to supply, borrow, and view your account details.
            </p>
            <Button
              onClick={() => setShow(true)}
              className={'mt-6 bg-[#7F56D9] text-[#fff] rounded-full font-semibold h-10'}
            >
              Connect wallet
            </Button>
          </div>
        </div>
      )}
      <ModalConnectWallet isModalOpen={!!show} handleClose={toggle} />
      <ModalTetherLive isModalOpen={!!showTether} handleClose={closePopupTether} />
    </AssetContextProvider>
  );
};
export default Page;
