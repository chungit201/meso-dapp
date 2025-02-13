import { OtterSec } from '@/common/components/Icons';
import { DisCord, Telegram, TwitterIcon } from '@/common/components/Icons/social';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

export const Footer: React.FunctionComponent = () => {
  return (
    <div className={'bg-[#FFFFFF] py-6 '}>
      <div className={'container max-w-[1536px] mx-auto px-3'}>
        <div className={'flex flex-col sm:flex-row justify-between gap-4 items-center'}>
          <div className={'flex items-center gap-5'}>
            <Link href={'https://doc.meso.finance/security-audit'} target={'_blank'}>
              <div className={'flex items-center text-[#313547] gap-2'}>
                Audited by:
                <OtterSec className={'h-[20px] w-auto'} />
              </div>
            </Link>
            <Link href={'https://doc.meso.finance/security-audit'} target={'_blank'}>
              <div className={'flex items-center text-[#313547] gap-2'}>
                Oracle by:
                <Image
                  className={'h-[20px] w-auto'}
                  src={require('@/common/assets/images/Pyth Logotype_Dark 1.png')}
                  alt={''}
                />
              </div>
            </Link>
          </div>
          <div className={'flex gap-6'}>
            <Link
              className={'text-[#000000] hover:underline font-medium'}
              href={'https://doc.meso.finance/privacy-policy'}
              target={'_blank'}
            >
              Privacy Policy
            </Link>
            <Link
              className={'text-[#000000] hover:underline font-medium'}
              href={'https://doc.meso.finance/term-of-service-and-legal-disclaimer'}
              target={'_blank'}
            >
              Terms of Service
            </Link>
          </div>
          <div className={'flex gap-4'}>
            <Link className={''} href={'https://x.com/Meso_Finance'} target={'_blank'}>
              <div className={'w-[35px] h-[35px] flex items-center justify-center rounded-full bg-[#5846FB0D]'}>
                <TwitterIcon />
              </div>
            </Link>
            <Link className={''} href={'https://meso.finance/discord'} target={'_blank'}>
              <div className={'w-[35px] h-[35px] flex items-center justify-center rounded-full bg-[#5846FB0D]'}>
                <DisCord />
              </div>
            </Link>
            <Link className={''} href={'https://t.me/+2CUsHJ6shZwyMDc9'} target={'_blank'}>
              <div className={'w-[35px] h-[35px] flex items-center justify-center rounded-full bg-[#5846FB0D]'}>
                <Telegram />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Footer;
