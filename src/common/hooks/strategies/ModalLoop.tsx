import React, { useMemo } from 'react'
import { Modal, Tabs, Typography } from 'antd'
import { CloseIcon, SwapIcon } from '@/common/components/Icons'
import { generatePayloadUserPosition, Strategy } from '@/utils/stategies'
import { DepositLoop } from '@/common/components/Views/strategies/DepositLoop'
import { IncreaseLoop } from '@/common/components/Views/strategies/IncreaseLoop'
import { useQuery } from '@tanstack/react-query'
import BigNumber from 'bignumber.js'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import useContract from '@/common/hooks/useContract'
import { WithdrawLoop } from '@/common/components/Views/strategies/WithdrawLoop'
import { useAssets } from '@/common/hooks/assets/useAssets'

interface Props {
  isModalOpen: boolean
  handleClose: () => void
  pair: Strategy
}

export enum LoopMode {
  DEPOSIT = 'Deposit',
  WITHDRAW = 'Withdraw',
  INCREASE = 'Increase',
}

export const ModalLoop: React.FunctionComponent<Props> = ({ isModalOpen, handleClose, pair }) => {
  const [mode, setMode] = React.useState<LoopMode>(LoopMode.DEPOSIT)
  const { assetDebts, assetDeposits } = useAssets()

  const { account } = useWallet()
  const { view } = useContract()

  const handleChange = (value: string) => {
    setMode(value as any)
  }

  const { data: { totalSupplied = 0, totalDebt = 0, userLeverage = 0 } = {}, refetch: refetchPosition } = useQuery({
    queryKey: ['UserPosition', pair, account],
    queryFn: async () => {
      const userPosition = await view(generatePayloadUserPosition(pair, account?.address as string))
      const totalSupplied =
        pair.asset0.token.symbol === 'stAPT'
          ? BigNumber(Number(userPosition[0]))
              .div(BigNumber(10).pow(pair.asset0.token.decimals))
              .div(pair.asset0.token.price)
              .toNumber()
          : BigNumber(Number(userPosition[0])).div(BigNumber(10).pow(pair.asset0.token.decimals)).toNumber()

      const totalDebt =
        pair.asset0.token.symbol === 'stAPT'
          ? BigNumber(Number(userPosition[2]))
              .div(BigNumber(10).pow(pair.asset0.token.decimals))
              .div(pair.asset0.token.price)
              .toNumber()
          : BigNumber(Number(userPosition[2])).div(BigNumber(10).pow(pair.asset0.token.decimals)).toNumber()

      const userLeverage = BigNumber(Number(userPosition[3])).div(BigNumber(100)).toNumber()

      return {
        totalSupplied,
        totalDebt,
        userLeverage,
      }
    },
    enabled: !!pair && !!account,
  })

  const amountDeposited = useMemo(() => {
    if (assetDeposits.length === 0) return 0
    const assetDeposit = assetDeposits.find((x) => x.token.symbol === pair.asset0.token.symbol)
    const assetBorrow = assetDebts.find((x) => x.token.symbol === pair.asset1.token.symbol)
    if (!assetDeposit || !assetBorrow) return 0
    if (assetDeposit && assetBorrow) {
      return (
        (assetDeposit.amountDeposit * assetDeposit.token.price - assetBorrow.debtAmount * assetBorrow.token.price) /
        assetDeposit.token.price
      )
    }
    return 0
  }, [assetDeposits, assetDebts])

  return (
    <Modal
      centered
      onCancel={() => {
        handleClose()
      }}
      open={isModalOpen}
      footer={false}
      closable={false}
      title={
        <div className={'flex items-center justify-between gap-3'}>
          <div className={'flex text-[#344054] font-semibold  gap-3 items-center'}>
            <div>Looping</div>
            <div className={'flex items-center gap-2 text-base'}>
              <Typography.Text>{pair.asset0.token.symbol}</Typography.Text>
              <SwapIcon />
              <Typography.Text>{pair.asset1.token.symbol}</Typography.Text>
            </div>
          </div>
          <div className={'flex items-center gap-2'}>
            <div onClick={handleClose} className={'cursor-pointer'}>
              <CloseIcon />
            </div>
          </div>
        </div>
      }
      width={483}
    >
      <div className={'p-6 pt-0'}>
        <Tabs className={'manage-tabs'} onChange={handleChange} activeKey={mode} defaultActiveKey={mode}>
          <Tabs.TabPane animated={false} tab={LoopMode.DEPOSIT} key={LoopMode.DEPOSIT.toString()}>
            <DepositLoop pair={pair} />
          </Tabs.TabPane>
          <Tabs.TabPane animated={false} tab={LoopMode.INCREASE} key={LoopMode.INCREASE.toString()}>
            <IncreaseLoop
              pair={pair}
              totalSupplied={totalSupplied}
              userLeverage={userLeverage}
              amountDeposited={amountDeposited}
              refetch={refetchPosition}
            />
          </Tabs.TabPane>
          {pair.asset0.token.symbol !== 'stAPT' && (
            <Tabs.TabPane animated={false} tab={LoopMode.WITHDRAW} key={LoopMode.WITHDRAW.toString()}>
              <WithdrawLoop
                pair={pair}
                userLeverage={userLeverage}
                amountDeposited={amountDeposited}
                refetch={refetchPosition}
              />
            </Tabs.TabPane>
          )}
        </Tabs>
      </div>
    </Modal>
  )
}
