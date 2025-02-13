import React, { useMemo } from 'react'
import { Button, Col, Row, Typography } from 'antd'
import BigNumber from 'bignumber.js'
import { useIsolatePools } from '@/common/hooks/useIsolatePools'
import { formatNumberBalance } from '@/utils'
import { useModal } from '@/common/hooks/useModal'
import { ModalSupplyPosition } from '@/common/components/Views/isolate/modals/ModalSupplyPosition'
import { ModalWithdrawPosition } from '@/common/components/Views/isolate/modals/ModalWithdrawPosition'
import { ModalBorrowPosition } from '@/common/components/Views/isolate/modals/ModalBorrowPosition'
import { ModalRepayPosition } from '@/common/components/Views/isolate/modals/ModalRepayPosition'

interface Props {
  liability: PoolAsset
  pool: IsolatePools
}

export const IsolateLiability: React.FunctionComponent<Props> = ({ liability, pool }) => {
  const { assetsAmounts, assetsDebts } = useIsolatePools()

  const { show: showSupply, setShow: setShowSupply, toggle: toggleSupply } = useModal()
  const { show: showWithdraw, setShow: setShowWithdraw, toggle: toggleWithdraw } = useModal()
  const { show: showBorrow, setShow: setShowBorrow, toggle: toggleBorrow } = useModal()
  const { show: showRepay, setShow: setShowRepay, toggle: toggleRepay } = useModal()

  const totalSupply = useMemo(() => {
    const data = assetsAmounts.find((x: any) => x.poolAddress === liability.poolAddress && pool.position === x.position)
    return data ? BigNumber(Number(data.value)).div(BigNumber(10).pow(liability.token.decimals)).toNumber() : 0
  }, [liability, assetsAmounts, pool])

  const totalBorrow = useMemo(() => {
    const data = assetsDebts.find((x: any) => x.poolAddress === liability.poolAddress && pool.position === x.position)
    return data ? BigNumber(Number(data.value)).div(BigNumber(10).pow(liability.token.decimals)).toNumber() : 0
  }, [liability, assetsAmounts, pool])

  return (
    <Col xs={24} xl={12}>
      <div className={''}>
        <div className={'p-5 bg-[#FCFCFD] border-b border-t sm:border-t-0 border-[#E4E7EC]'}>
          <div className={'flex items-center gap-3'}>
            <div className={'text-[#667085]'}>Liability</div>
            <div className={'flex items-center gap-2'}>
              <div className={'w-[25px]'}>
                <img
                  className={'w-[25px] h-auto'}
                  src={`https://image.meso.finance/${liability.token?.symbol.toLowerCase()}.png`}
                  alt={''}
                />
              </div>
              <Typography className={'text-[#344054] font-semibold'}>{liability.token.symbol}</Typography>
            </div>
          </div>
        </div>
        <div className={'grid divide-x  divide-[#E4E7EC] grid-cols-3'}>
          <div className={'flex flex-col gap-4 p-4 sm:p-5'}>
            <div className={'text-[#667085]'}>Your supply</div>
            <div>
              <div className={'text-[#475467] font-medium'}>{formatNumberBalance(totalSupply, 4)}</div>
              <div className={'text-[#98A2B3] text-xs'}>
                ${formatNumberBalance(totalSupply * liability.token.price, 4)}
              </div>
            </div>
          </div>
          <div className={'flex flex-col gap-4 p-4 sm:p-5'}>
            <div className={'text-[#667085]'}>Total supply</div>
            <div>
              <div className={'text-[#475467] font-medium'}>
                {formatNumberBalance(
                  BigNumber(liability.poolSupply).div(BigNumber(10).pow(liability.token.decimals)).toNumber(),
                  4,
                )}
              </div>
              <div className={'text-[#98A2B3] text-xs'}>
                $
                {formatNumberBalance(
                  BigNumber(liability.poolSupply * liability.token.price)
                    .div(BigNumber(10).pow(liability.token.decimals))
                    .toNumber(),
                  4,
                )}
              </div>
            </div>
          </div>
          <div className={'flex flex-col gap-4 p-4 sm:p-5'}>
            <div className={'text-[#667085]'}>Supply APR</div>
            <div>
              <div className={'text-[#039855] font-medium'}>{formatNumberBalance(liability.supplyApy, 2)}%</div>
            </div>
          </div>
        </div>
        <div className={'grid divide-x border-t border-[#E4E7EC] divide-[#E4E7EC] grid-cols-3'}>
          <div className={'flex flex-col gap-4 p-4 sm:p-5'}>
            <div className={'text-[#667085]'}>Your borrow</div>
            <div>
              <div className={'text-[#475467] font-medium'}>{formatNumberBalance(totalBorrow, 4)}</div>
              <div className={'text-[#98A2B3] text-xs'}>
                ${formatNumberBalance(totalBorrow * liability.token.price, 4)}
              </div>
            </div>
          </div>
          <div className={'flex flex-col gap-4 p-4 sm:p-5'}>
            <div className={'text-[#667085]'}>Total borrow</div>
            <div>
              <div className={'text-[#475467] font-medium'}>
                {formatNumberBalance(
                  BigNumber(liability.totalDebt).div(BigNumber(10).pow(liability.token.decimals)).toNumber(),
                  4,
                )}
              </div>
              <div className={'text-[#98A2B3] text-xs'}>
                $
                {formatNumberBalance(
                  BigNumber(liability.totalDebt * liability.token.price)
                    .div(BigNumber(10).pow(liability.token.decimals))
                    .toNumber(),
                  4,
                )}
              </div>
            </div>
          </div>
          <div className={'flex flex-col gap-4 p-4 sm:p-5'}>
            <div className={'text-[#667085]'}>Borrow APR</div>
            <div>
              <div className={'text-[#D92D20] font-medium'}>{formatNumberBalance(liability.borrowApy, 2)}%</div>
            </div>
          </div>
        </div>
        <Row className={'p-6 border-t border-[#F9F5FF]'} gutter={[12, 12]}>
          <Col xs={12} xl={6}>
            <Button
              // disabled={!position}
              onClick={() => setShowSupply(true)}
              className={
                'rounded-full w-full disabled:bg-[#DCDFEA] disabled:text-[#fff] flex-1 border-0 bg-[#F9F5FF] h-9 text-[#6941C6] font-semibold'
              }
            >
              Supply
            </Button>
          </Col>
          <Col xs={12} xl={6}>
            <Button
              onClick={() => setShowWithdraw(true)}
              className={
                'rounded-full w-full disabled:bg-[#DCDFEA] disabled:text-[#fff] flex-1 border-0 bg-[#F9F5FF] h-9 text-[#6941C6] font-semibold'
              }
            >
              Withdraw
            </Button>
          </Col>
          <Col xs={12} xl={6}>
            <Button
              onClick={() => setShowBorrow(true)}
              className={
                'rounded-full w-full flex-1 disabled:bg-[#DCDFEA] disabled:text-[#fff] border-0 bg-[#F9F5FF] h-9 text-[#6941C6] font-semibold'
              }
            >
              Borrow
            </Button>
          </Col>
          <Col xs={12} xl={6}>
            <Button
              onClick={() => setShowRepay(true)}
              className={
                'rounded-full w-full disabled:bg-[#DCDFEA] disabled:text-[#fff] flex-1 border-0 bg-[#F9F5FF] h-9 text-[#6941C6] font-semibold'
              }
            >
              Repay
            </Button>
          </Col>
        </Row>
      </div>
      <ModalSupplyPosition
        isModalOpen={!!showSupply}
        collateral={pool.liability[0]}
        isolatePool={pool}
        handleClose={toggleSupply}
      />
      {showWithdraw && (
        <ModalWithdrawPosition
          isModalOpen={showWithdraw}
          asset={pool.liability[0]}
          handleClose={toggleWithdraw}
          isolatePool={pool}
        />
      )}
      <ModalBorrowPosition
        isolatePool={pool}
        isModalOpen={!!showBorrow}
        asset={pool.liability[0]}
        handleClose={toggleBorrow}
      />
      <ModalRepayPosition
        isolatePool={pool}
        isModalOpen={!!showRepay}
        collateral={pool.liability[0]}
        handleClose={toggleRepay}
      />
    </Col>
  )
}
