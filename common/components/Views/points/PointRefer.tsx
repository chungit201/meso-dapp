import { DirectIcon, PointCopyIcon, PointReferIcon1, PointReferIcon2 } from '@/common/components/Icons';
import { StarIcon, UpgradeIcon } from '@/common/components/Icons/points';
import useNetworkConfiguration from '@/common/hooks/useNetwork';
import appActions from '@/modules/app/actions';
import { copyToClipboard, ellipseAddress } from '@/utils';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button } from 'antd';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

interface Props {
  userInfo: any;
}

export const PointRefer: React.FunctionComponent<Props> = ({ userInfo }) => {
  const [copyText, setCopyText] = useState('Copy');
  const { networkCfg } = useNetworkConfiguration();
  const { connected } = useWallet();
  const dispatch = useDispatch();

  const handleCopy = () => {
    setCopyText('Copied!');
    setTimeout(() => {
      setCopyText('Copy');
    }, 1000);
    copyToClipboard(userInfo.referralLink as any);
  };

  return (
    <div className={'w-full my-20 px-2 '}>
      <div className={'relative point-refer w-full flex flex-col max-w-[860px] p-3 sm:p-6 mx-auto gap-6'}>
        <Image
          className={'absolute bottom-0 right-0 rounded-br-[20px] z-0'}
          src={require('@/common/assets/images/points/blur-bg-1.png')}
          alt={''}
        />
        <Image
          className={'absolute bottom-0 left-[-8px] sm:left-2 z-0'}
          src={require('@/common/assets/images/points/blur-bg-2.png')}
          alt={''}
        />
        <Image
          className={'absolute top-0 left-1/2 -translate-x-1/2 z-0'}
          src={require('@/common/assets/images/points/blur-bg-3.png')}
          alt={''}
        />
        <div className={'relative z-20'}>
          <div className={'text-3xl sm:text-3xl text-[#272B50] font-bold segoe-bold'}>Refer and earn now!</div>
          <div className={'text-base texy-[#7B8AB1] mt-1'}>Share your referral link to your friends.</div>
          <div>
            <div className={'flex flex-col sm:flex-row gap-3 mt-5 sm:mt-3'}>
              <span className={'border flex items-center gap-1 border-[#DBE4FF] bg-[#245ff614] px-3 py-2 rounded-full'}>
                <UpgradeIcon />
                <span className={'text-gradient-point font-bold'}>
                  You receive: +{userInfo?.referralCommissionPercentage}% points
                </span>
                <StarIcon />
              </span>
              <span className={'border flex items-center gap-1 border-[#DBE4FF] bg-[#245ff614] px-3 py-2 rounded-full'}>
                <UpgradeIcon />
                <span className={'text-gradient-point font-bold'}>
                  Your friends receive: +{userInfo?.referralCommissionPercentage ?? 10}% points
                </span>
                <StarIcon />
              </span>
            </div>
          </div>
        </div>
        <div className={'w-full flex flex-col sm:flex-row gap-4 z-20'}>
          <div className={'w-full flex justify-between bg-white rounded-[16px] border border-[#5266E233] p-4 z-20'}>
            <div className={'flex flex-col justify-between'}>
              <div className={'text-[40px] text-[#527CFC] font-bold leading-normal'}>
                {userInfo ? userInfo.totalInvited : '-'}
              </div>
              <div className={'text-base text-[#3845ADB2] font-medium'}>Total invited</div>
            </div>
            <PointReferIcon1 />
          </div>
          <div className={'w-full flex justify-between bg-white rounded-[16px] border border-[#5266E233] p-4 z-20'}>
            <div className={'flex flex-col justify-between'}>
              <div className={'text-[40px] text-[#527CFC] font-bold leading-normal'}>
                {userInfo ? userInfo.referralPoint : '-'}
              </div>
              <div className={'text-base text-[#3845ADB2] font-medium'}>Referral points</div>
            </div>
            <PointReferIcon2 />
          </div>
        </div>
        <div
          className={
            'relative w-full flex flex-col sm:flex-row justify-between items-start gap-4 sm:items-center bg-white rounded-[16px] border border-[#5266E233] px-6 py-5 z-20 sm:gap-2 sm:gap-0'
          }
        >
          <div className={'text-sm sm:text-lg text-[#272B50] font-semibold'}>
            {userInfo ? userInfo?.referralLink : '--'}
          </div>
          {connected ? (
            <Button
              onClick={handleCopy}
              icon={<PointCopyIcon />}
              className={'flex items-center h-[40px] rounded-[8px] bg-[#7F56D9] text-white text-base px-4 gap-1'}
            >
              {copyText}
            </Button>
          ) : (
            <Button
              onClick={() => {
                dispatch(appActions.SET_SHOW_CONNECT(true));
              }}
              className={'flex items-center h-[40px] rounded-[8px] bg-[#7F56D9] text-white text-base px-4 gap-1'}
            >
              Connect wallet
            </Button>
          )}
        </div>
        <div className={`${!userInfo?.invitedBy && 'hidden'} flex items-center text-base text-[#7B8AB1] z-20 gap-2`}>
          Invited by <span className={'text-[#3845AD] font-semibold'}>{ellipseAddress(userInfo?.invitedBy, 5)}</span>{' '}
          <Link
            href={`https://explorer.aptoslabs.com/account/${userInfo?.invitedBy}?network=${networkCfg
              .toString()
              .toLocaleLowerCase()}`}
            target={'_blank'}
          >
            <DirectIcon />
          </Link>
        </div>
      </div>
    </div>
  );
};
