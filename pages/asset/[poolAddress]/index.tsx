import { BannerPage } from '@/common/components/Layout/BannerPage';
import { AssetDetailDashboard } from '@/common/components/Views/asset/AssetDetailDashboard';
import { AssetInfo } from '@/common/components/Views/asset/AssetInfo';
import { YourInfo } from '@/common/components/Views/asset/YourInfo';
import { AssetsContext } from '@/common/context';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Col, Row } from 'antd';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useState } from 'react';

const LoadingPage = dynamic(
  () => import('@/common/components/LoadingAssets/LoadingPage').then((mod) => mod.LoadingPage),
  {
    ssr: false,
  },
);

const Page: React.FunctionComponent = () => {
  const [asset, setAsset] = useState<PoolAsset | null>(null);
  const { allAssetsData, isLoading } = useContext(AssetsContext);
  const router = useRouter();
  const { account } = useWallet();

  useEffect(() => {
    if (allAssetsData.length > 0 && router.query.poolAddress) {
      const value = allAssetsData.find((x) => x.poolAddress === router.query.poolAddress);
      setAsset(value as any);
    }
  }, [allAssetsData, account, router]);

  return (
    <div className={'bg-[#fff] min-h-screen'}>
      <BannerPage />
      {isLoading && !asset && <LoadingPage />}
      {asset && !isLoading && (
        <div>
          <div className={'container max-w-[1536px] mx-auto -mt-[120px] pb-20 pt-10 px-3'}>
            <Row gutter={[18, 18]}>
              <Col xs={24} xl={24}>
                <div className={'space-y-5'}>
                  <AssetInfo asset={asset!} />
                </div>
              </Col>
              <Col xs={24} xl={17}>
                <AssetDetailDashboard asset={asset!} />
              </Col>
              <Col xs={24} xl={7}>
                <YourInfo asset={asset!} />
              </Col>
            </Row>
          </div>
        </div>
      )}
    </div>
  );
};
export default Page;
