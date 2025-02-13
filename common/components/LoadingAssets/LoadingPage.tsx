import { animationData } from '@/common/animation';
import Lottie from 'lottie-react';
import React from 'react';

export const LoadingPage: React.FunctionComponent = () => {
  return (
    <>
      <div className={'loading-mask h-screen'}>
        <div className={'absolute z-[1000] bottom-2/4 translate-y-2/4 w-full flex justify-center'}>
          <div className={'w-[70px]'}>
            <Lottie className={'loading-page'} width={50} height={30} animationData={animationData} loop={true} />
          </div>
        </div>
      </div>
    </>
  );
};
