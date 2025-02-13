import { BannerPage } from '@/common/components/Layout/BannerPage';
import { BannerTether } from '@/common/components/Views/BannerTether';
import MarketDashboard from '@/common/components/Views/dashboard/MarketDashboard';
import { UserDashBoard } from '@/common/components/Views/dashboard/UserDashBoard';
import { IsolatePools } from '@/common/components/Views/isolate/IsolatePools';
import { AssetsTable } from '@/common/components/Views/lending/AssetsTable';
import AssetContextProvider from '@/common/context/AssetContextProvider';
import { getData } from '@/common/hooks/useLocalStoragre';
import { getDiff, setHiddenTimeBannerTether } from '@/utils';
import { Row } from 'antd';
import React, { useEffect, useState } from 'react';

const Page: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const time = Number(getData('hiddenTimeBannerTether'));
    if (getDiff(time * 1000) < 0) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setHiddenTimeBannerTether();
  };

  return (
    <AssetContextProvider>
      <div className={'pb-10'}>
        <BannerPage />
        <div className="pb-10 -mt-20">
          <div className={'container max-w-[1536px] mx-auto px-3'}>
            <div className={'flex flex-col justify-start'}>
              <MarketDashboard />
              <UserDashBoard />
              <Row className={'mt-6'}>
                <AssetsTable />
              </Row>
              <IsolatePools />
            </div>
          </div>
        </div>
      </div>
      {isOpen && <BannerTether handleClose={handleClose} />}
    </AssetContextProvider>
  );
};
export default Page;
