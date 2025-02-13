import React, { useMemo } from 'react'
import { Button, Col, Typography } from 'antd'
import { useIsolatePools } from '@/common/hooks/useIsolatePools'
import BigNumber from 'bignumber.js'
import { formatNumberBalance } from '@/utils'
import { ModalAddCollateral } from '@/common/components/Views/isolate/modals/ModalAddCollateral'
import { ModalRemoveCollateral } from '@/common/components/Views/isolate/modals/ModalRemoveCollateral'
import { useModal } from '@/common/hooks/useModal'

interface Props {
  collateral: PoolAsset
  pool: IsolatePools
}

export const IsolateCollateral: React.FunctionComponent<Props> = ({ collateral, pool }) => {
  const { assetsAmounts } = useIsolatePools()
  const { show, setShow, toggle } = useModal()
  const { show: showRemove, setShow: setShowRemove, toggle: toggleRemove } = useModal()

  const totalDeposit = useMemo(() => {
    const data = assetsAmounts.find(
      (x: any) => x.poolAddress === collateral.poolAddress && pool.position === x.position,
    )
    return data ? BigNumber(Number(data.value)).div(BigNumber(10).pow(collateral.token.decimals)).toNumber() : 0
  }, [collateral, assetsAmounts, pool])

  return (
    <Col xs={24} xl={12}>
      <div className={'flex flex-col '}>
        <div className={'border-r border-[#E4E7EC] flex flex-col'}>
          <div className={'p-5 bg-[#FCFCFD] border-b border-[#E4E7EC]'}>
            <div className={'flex items-center gap-3'}>
              <div className={'text-[#667085]'}>Collateral</div>
              <div className={'flex items-center gap-2'}>
                <div className={'w-[25px]'}>
                  <img
                    className={'w-[25px] h-auto'}
                    src={`https://image.meso.finance/${collateral.token?.symbol.toLowerCase()}.png`}
                    alt={''}
                  />
                </div>
                <Typography className={'text-[#344054] font-semibold'}>{collateral.token.symbol}</Typography>
              </div>
            </div>
          </div>
          <div className={'grid divide-x divide-[#E4E7EC] collateral_info grid-cols-2'}>
            <div className={'flex flex-col gap-4 p-5'}>
              <div className={'text-[#667085]'}>Your deposit</div>
              <div>
                <div className={'text-[#475467] font-medium'}>{formatNumberBalance(totalDeposit, 4)}</div>
                <div className={'text-[#98A2B3] text-xs'}>
                  ${formatNumberBalance(totalDeposit * collateral.token.price, 4)}
                </div>
              </div>
            </div>
            <div className={'flex flex-col gap-4 p-5'}>
              <div className={'text-[#667085]'}>Total deposit</div>
              <div>
                <div className={'text-[#475467] font-medium'}>
                  {formatNumberBalance(
                    BigNumber(collateral.poolSupply).div(BigNumber(10).pow(collateral.token.decimals)).toNumber(),
                    4,
                  )}
                </div>
                <div className={'text-[#98A2B3] text-xs'}>
                  ${' '}
                  {formatNumberBalance(
                    BigNumber(collateral.poolSupply * collateral.token.price)
                      .div(BigNumber(10).pow(collateral.token.decimals))
                      .toNumber(),
                    4,
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={'flex items-center mt-auto p-6 gap-4 border-t border-r border-[#E4E7EC]'}>
          <Button
            onClick={() => setShow(true)}
            className={'rounded-full flex-1 border-0 bg-[#F9F5FF] h-9 text-[#6941C6] font-semibold'}
          >
            Add
          </Button>
          <Button
            onClick={() => setShowRemove(true)}
            className={'rounded-full flex-1 border-0 bg-[#F9F5FF] h-9 text-[#6941C6] font-semibold'}
          >
            Remove
          </Button>
        </div>
      </div>
      <ModalAddCollateral isolatePool={pool} isModalOpen={!!show} collateral={collateral} handleClose={toggle} />
      <ModalRemoveCollateral
        isolatePool={pool}
        isModalOpen={!!showRemove}
        collateral={collateral}
        handleClose={toggleRemove}
      />
    </Col>
  )
}
