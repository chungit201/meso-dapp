import React, { useContext } from 'react'
import { Button, Card, Col, Typography } from 'antd'
import { useRewards } from '@/common/hooks/assets/useRewards'
import { formatNumberBalance } from '@/utils'
import useTransactionCallback from '@/common/hooks/assets/useTransactionCallback'
import { AssetsContext } from '@/common/context'
import { MESO_ADDRESS } from '@/common/consts'

export const AssetRewards: React.FunctionComponent = () => {
  const { totalRewards } = useRewards()
  const transactionCallback = useTransactionCallback()
  const { allAssetsData } = useContext(AssetsContext)

  const handleClaim = () => {
    try {
      const pools = []
      for (const item of allAssetsData) {
        pools.push(item.token.address)
      }
      transactionCallback({
        payload: {
          function: `${MESO_ADDRESS}::meso::claim_all_apt_rewards`,
          typeArguments: [],
          functionArguments: [pools as any],
        },
        onSuccess(hash: string) {
          console.log('hash', hash)
        },
      })
    } catch (e) {
      console.log('e', e)
    }
  }

  return (
    <Col xs={24} xl={8}>
      <Card className={'border-[#F3F5F8] rounded-[12px]'}>
        <div
          className={'bg-[#F3F5F8] flex justify-between items-center text-lg p-3 rounded-tl-[12px] rounded-tr-[12px]'}
        >
          <Typography>Rewards</Typography>
          <Button className={'h-8 bg-[#2458F6] rounded text-[#fff]'} onClick={handleClaim}>
            Claim
          </Button>
        </div>
        <div className={'min-h-[150px] overflow-y-auto'}>
          <div className={'p-3 flex asset-row justify-between border-b border-[#F3F5F8]'}>
            <div className={'flex items-center gap-2'}>
              <img className={'w-[25px] h-auto'} src={`https://image.meso.finance/apt.png`} alt={''} />
              <Typography className={'text-lg'}>APT</Typography>
            </div>
            <Typography>{formatNumberBalance(totalRewards, 8)}</Typography>
          </div>
        </div>
      </Card>
    </Col>
  )
}
