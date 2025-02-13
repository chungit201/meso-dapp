import React from 'react'
import Image from 'next/image'
import { Button } from 'antd'
import { useRouter } from 'next/router'
import { CloseIconVector } from '@/common/components/Icons/points'

interface Props {
  handleClose: () => void
}

export const BannerTether: React.FunctionComponent<Props> = ({ handleClose }) => {
  const router = useRouter()
  const gotoRedeem = () => {
    router.push('/convert')
  }

  return (
    <div className={'fixed bottom-5 flex items-center gap-3 p-4 right-1 sm:right-5 bannerTetherBox z-[100]'}>
      <div onClick={handleClose} className={'absolute cursor-pointer top-5 right-3'}>
        <CloseIconVector />
      </div>
      <div>
        <Image className={'w-[125px]'} src={require('@/common/assets/images/USDC-convert.png')} alt={''} />
      </div>
      <div>
        <h3 className={'text-[#101828] text-sm sm:text-base font-semibold'}>USDC Conversion: NO fees required!!!</h3>
        <p className={'max-w-[320px] mt-2 text-xs sm:text-sm'}>
          Easily redeem into your USDC at the fixed rate of 1:1. {"Don't"} miss out!
        </p>
        <Button onClick={gotoRedeem} className={'border-0 mt-3 bg-[#7F56D9] text-[#fff] rounded-full'}>
          Start now
        </Button>
      </div>
    </div>
  )
}
