import React, { useState } from 'react'
import { copyToClipboard, ellipseAddress, formatNumberBalance } from '@/utils'
import { Tooltip } from 'antd'
import { CopyIcon } from '@/common/components/Icons'
import BigNumber from 'bignumber.js'
import { MAX_BPS } from '@/common/consts'
import useUser from '@/common/hooks/useUser'

interface Props {
  asset: PoolAsset
}

export const AssetMoreInformation: React.FunctionComponent<Props> = ({ asset }) => {
  const { userEMode } = useUser()
  const [copyText, setCopyText] = useState('Copy')

  const handleCopy = (value: string) => {
    setCopyText('Copied!')
    setTimeout(() => {
      setCopyText('Copy')
    }, 1000)
    copyToClipboard(value)
  }

  return (
    <div className={'space-y-4'}>
      <div className={'flex justify-between'}>
        <div>Reserve Address</div>
        <div className={'flex items-center gap-2'}>
          {ellipseAddress(asset.token.address, 6)}{' '}
          <Tooltip title={copyText}>
            <div onClick={() => handleCopy(asset.token.address)} className={'cursor-pointer'}>
              <CopyIcon />
            </div>
          </Tooltip>
        </div>
      </div>
      <div className={'flex justify-between'}>
        <div>Coin Address</div>
        <div className={'flex items-center gap-2'}>
          {ellipseAddress(asset.token.address, 6)}{' '}
          <Tooltip title={copyText}>
            <div onClick={() => handleCopy(asset.token.address)} className={'cursor-pointer'}>
              <CopyIcon />
            </div>
          </Tooltip>
        </div>
      </div>
      <div className={'flex justify-between'}>
        <div>Pool Address</div>
        <div className={'flex items-center gap-2'}>
          {ellipseAddress(asset.poolAddress, 6)}{' '}
          <Tooltip title={copyText}>
            <div onClick={() => handleCopy(asset.poolAddress)} className={'cursor-pointer'}>
              <CopyIcon />
            </div>
          </Tooltip>
        </div>
      </div>
      <div className={'flex justify-between'}>
        <div>Deposit Limit</div>
        <div className={'flex items-center gap-2'}>
          {formatNumberBalance(BigNumber(asset.supplyCap).div(BigNumber(10).pow(asset.token.decimals)).toNumber(), 0)}{' '}
          {asset.token.symbol}
        </div>
      </div>
      <div className={'flex justify-between'}>
        <div>Borrow Limit</div>
        <div className={'flex items-center gap-2'}>
          {formatNumberBalance(BigNumber(asset.borrowCap).div(BigNumber(10).pow(asset.token.decimals)).toNumber(), 0)}{' '}
          {asset.token.symbol}
        </div>
      </div>
      <div className={'flex justify-between'}>
        <div>Borrow Fee</div>
        <div className={'flex items-center gap-2'}>{formatNumberBalance((asset.borrowFeeBps / MAX_BPS) * 100, 4)}%</div>
      </div>
      <div className={'flex justify-between'}>
        <div>Flash Loan Fee</div>
        <div className={'flex items-center gap-2'}>{formatNumberBalance((asset.borrowFeeBps / MAX_BPS) * 100, 4)}%</div>
      </div>
      <div className={'flex justify-between'}>
        <div>Borrow Factor</div>
        <div className={'flex items-center gap-2'}>100%</div>
      </div>

      <div className={'flex justify-between'}>
        <div>Liquidation threshold</div>
        <div className={'flex items-center gap-2'}>
          {userEMode === asset.emodeId
            ? (asset.emodeLiquidationThresholdBps / MAX_BPS) * 100
            : (asset.liquidationThresholdBps / MAX_BPS) * 100}
          %
        </div>
      </div>
      <div className={'flex justify-between'}>
        <div>Optimal Utilization</div>
        <div className={'flex items-center gap-2'}>
          {formatNumberBalance((asset.optimalUtilizationBps / MAX_BPS) * 100, 2)}%
        </div>
      </div>
      <div className={'flex justify-between'}>
        <div>Optimal Interest Rate</div>
        <div className={'flex items-center gap-2'}>{formatNumberBalance((asset.optimalBps / MAX_BPS) * 100, 2)}%</div>
      </div>
      <div className={'flex justify-between'}>
        <div>Max Interest Rate</div>
        <div className={'flex items-center gap-2'}>{(asset.maxBps / MAX_BPS) * 100}%</div>
      </div>
    </div>
  )
}
