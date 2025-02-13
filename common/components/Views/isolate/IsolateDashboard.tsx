import React from 'react'
import { Typography } from 'antd'
import { IsolateBox } from '@/common/components/Views/isolate/IsolateBox'
import { useIsolatePools } from '@/common/hooks/useIsolatePools'

export const IsolateDashboard: React.FunctionComponent = () => {
  const { userPools } = useIsolatePools()

  return (
    <div className={'container max-w-[1536px] -mt-20 mx-auto pb-40 px-3'}>
      <Typography className={'text-[#101828] font-semibold text-center text-2xl'}>Isolated Pools</Typography>
      <div className={'mt-10 flex flex-col gap-5'}>
        {userPools.map((item, index) => {
          return (
            <>
              <IsolateBox pool={item} key={index} />
            </>
          )
        })}
      </div>
    </div>
  )
}
