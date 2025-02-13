import React from 'react'
import { Typography } from 'antd'
import { SwapIcon } from '@/common/components/Icons'
import { Strategy } from '@/utils/stategies'

interface Props {
  pair: Strategy
}

export const PairInfo: React.FunctionComponent<Props> = ({ pair }) => {
  return (
    <div className={'flex gap-3 items-center'}>
      <div className={'flex'}>
        <div className={'w-[25px]'}>
          <img
            className={'w-[25px] h-auto'}
            src={`https://image.meso.finance/${pair.asset0.token.symbol.toLowerCase()}.png`}
            alt={''}
          />
        </div>
        <div className={'w-[25px] -ml-2'}>
          <img
            className={'w-[25px] h-auto'}
            src={`https://image.meso.finance/${pair.asset1.token.symbol.toLowerCase()}.png`}
            alt={''}
          />
        </div>
      </div>
      <div className={'flex text-[#344054] font-semibold items-center gap-2 text-base'}>
        <Typography.Text>{pair.asset0.token.symbol}</Typography.Text>
        <SwapIcon />
        <Typography.Text>{pair.asset1.token.symbol}</Typography.Text>
      </div>
    </div>
  )
}
