import React from 'react'
import bannerTop from '@/common/assets/images/banner-top.png'

export const BannerPage: React.FunctionComponent = () => {
  return (
    <div className={'relative'}>
      <div style={{ backgroundImage: `url(${bannerTop.src})` }} className={'banner-top h-[175px]'}></div>
      <div
        className={'absolute w-full h-full top-0 left-0'}
        style={{
          background:
            'linear-gradient(0deg, rgba(255, 255, 255, 0) -33.46%, rgba(50, 58, 115, 0.716888) 64.35%, rgba(26, 35, 98, 0.8) 98.25%)',
        }}
      ></div>
    </div>
  )
}
