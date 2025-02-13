import { isAddress } from '@/utils';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Typography } from 'antd';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { isMobile } from 'react-device-detect';

const rickFactorProgressDesktop = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
const rickFactorProgressMobile = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

interface Props {
  width?: number;
  height?: number;
  borrowPower: number;
}

export const BorrowingPowerProgress: React.FunctionComponent<Props> = ({ width = 4, height = 22, borrowPower }) => {
  const rickFactorProgress = isMobile ? rickFactorProgressMobile : rickFactorProgressDesktop;
  const { account } = useWallet();
  const router = useRouter();

  const walletAddress = useMemo(
    () =>
      router.query.view_address && isAddress(router.query.view_address as string)
        ? router.query.view_address
        : account?.address,
    [account, router],
  );
  return (
    <div>
      <div>
        <Typography className={'font-medium text-[#5D6B98] text-[14px] sm:text-sm'}>
          Borrowing Capacity (% used)
        </Typography>
        <div>
          {walletAddress ? (
            <div className={'flex items-center gap-3 mt-1'}>
              <span className={'text-xl text-gradient font-semibold'}>
                <span>{borrowPower > 100 ? 100 : borrowPower}%</span>
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
                      className={`${item <= Number(borrowPower) && 'active-progress'} bg-[#DCDFEA] rounded-[2px]`}
                    ></div>
                  );
                })}
              </div>
            </div>
          ) : (
            <span className={'text-xl mt-1'}>--</span>
          )}
        </div>
      </div>
    </div>
  );
};
