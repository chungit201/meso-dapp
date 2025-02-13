import React, { useEffect } from 'react'
import { Card, Typography } from 'antd'
import Image from 'next/image'
import { useAssets } from '@/common/hooks/assets/useAssets'
import { formatNumberBalance } from '@/utils'

export const AccountReward: React.FunctionComponent = () => {
  const [totalValue, setTotalValue] = React.useState(0)
  const { assetDeposits, isFetching } = useAssets()
  const rewards: any = []
  useEffect(() => {
    let total = 0
    for (const item of assetDeposits) {
      total += item.amountDeposit * Number(item?.token?.price)
    }
    setTotalValue(total)
  }, [assetDeposits])

  return (
    <Card className={'w-[350px] border-[#19182A] bg-transparent text-[#adb8d8] rounded-[8px]'}>
      <div className={'bg-[#0D0D0D] flex justify-between px-4 py-3 rounded-tl-[8px] rounded-tr-[8px]'}>
        <Typography className={'text-[#fff] text-lg'}>Rewards</Typography>
        <span className={'text-[#fff] text-lg'}>${formatNumberBalance(totalValue, 2)}</span>
      </div>
      <div className={'p-4 space-y-3'}>
        {!isFetching && rewards.length > 0 && (
          <>
            {rewards.map((item: any, index: any) => {
              return (
                <div key={index} className={'flex justify-between'}>
                  <div className={'flex items-center gap-2'}>
                    <div className={'w-[35px]'}>
                      <Image src={item.image} alt={''} />
                    </div>
                    <div>
                      <div className={'text-[#fff]'}>{item.symbol}</div>
                      <div>${formatNumberBalance(item.price, 4)}</div>
                    </div>
                  </div>
                  <div className={'text-end'}>
                    <div className={'text-[#fff]'}>
                      {formatNumberBalance(item.amountDeposit, 4)} {item.symbol}
                    </div>
                    <div>${formatNumberBalance(item.amountDeposit * Number(item.price), 2)}</div>
                  </div>
                </div>
              )
            })}
          </>
        )}
        {rewards.length === 0 && <div>No Rewards</div>}
      </div>
    </Card>
  )
}
