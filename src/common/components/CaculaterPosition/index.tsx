import React, { useMemo } from 'react'
import { useAssets } from '@/common/hooks/assets/useAssets'
import { formatNumberBalance } from '@/utils'
import { LeftToRightIcon } from '@/common/components/Icons'
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets'
import useUser from '@/common/hooks/useUser'
import { MAX_BPS, MESO_ADDRESS } from '@/common/consts'
import { useQuery } from '@tanstack/react-query'
import useContract from '@/common/hooks/useContract'
import BigNumber from 'bignumber.js'
import { getBorrowRate } from '@/utils/assets'
import { calculatorPosition } from '@/utils/calculator'

interface Props {
  amount: number
  asset: PoolAsset
  mode: ManageAssetMode
}

export const CalculatorPosition: React.FunctionComponent<Props> = ({ mode, amount, asset }) => {
  const { riskFactor } = useAssets()
  const { assetDebts, assetDeposits } = useAssets()
  const { userEMode } = useUser()
  const { view } = useContract()

  const { data: poolsData = null } = useQuery({
    queryKey: ['PoolData', asset],
    queryFn: async () => {
      const data: any = await view({
        function: `${MESO_ADDRESS}::lending_pool::pool_data`,
        typeArguments: [],
        functionArguments: [[asset.poolAddress]],
      })
      return data[0][0] ?? []
    },
  })

  const { data: { etSupplyApy = 0, etBorrowApy = 0 } = {} } = useQuery({
    queryKey: ['CalculatorApr', amount, asset, poolsData, mode],
    queryFn: async () => {
      const { supplyApy, borrowApy } = await calculateApy(asset, amount, mode)
      return { etSupplyApy: supplyApy, etBorrowApy: borrowApy }
    },
    enabled: !!asset && !!amount && !!poolsData,
  })

  const getTotalBalanceChanged = (amount: number, mode: ManageAssetMode, asset: PoolAsset) => {
    switch (mode) {
      case ManageAssetMode.Supply:
        return {
          poolSupply: amount + asset.poolSupply,
          totalDebt: asset.totalDebt,
        }
      case ManageAssetMode.Withdraw:
        return {
          poolSupply: asset.poolSupply - amount,
          totalDebt: asset.totalDebt,
        }
      case ManageAssetMode.Borrow:
        return {
          poolSupply: asset.poolSupply,
          totalDebt: asset.totalDebt + amount,
        }
      case ManageAssetMode.Repay:
        return {
          poolSupply: asset.poolSupply,
          totalDebt: asset.totalDebt,
        }
    }
  }

  const calculateApy = async (
    pool: PoolAsset,
    amount: number,
    mode: ManageAssetMode,
  ): Promise<{ borrowApy: number; supplyApy: number }> => {
    // const compounding = 365 // compound daily
    const MAX_BPS_U128 = 10000
    if (!MESO_ADDRESS) {
      return { borrowApy: 0, supplyApy: 0 }
    }

    let borrowApr = 0
    let supplyApr = 0
    const borrowApy = 0
    const supplyApy = 0
    const incentiveRewards = (pool.poolSupply * pool.incentiveSupplyApy) / 100

    const { totalDebt, poolSupply } = getTotalBalanceChanged(
      BigNumber(amount).times(BigNumber(10).pow(pool.token.decimals)).toNumber(),
      mode,
      pool,
    )
    const calculatorIncentiveSupplyApr = (incentiveRewards / poolSupply) * 100

    const curr_utilization = totalDebt / poolSupply
    const borrowRate = getBorrowRate(curr_utilization, pool)
    const accrued_interest = (totalDebt * borrowRate) / MAX_BPS_U128
    if (totalDebt == 0) {
      return { borrowApy, supplyApy }
    }
    borrowApr = (accrued_interest / totalDebt) * 100
    const fees = (accrued_interest * pool.protocolInterestFeeBps) / MAX_BPS_U128
    supplyApr = ((accrued_interest - fees) / poolSupply) * 100
    return { borrowApy: borrowApr, supplyApy: supplyApr + calculatorIncentiveSupplyApr }
  }

  const calculator = useMemo(() => {
    let totalSupplyBalance = 0
    let totalBorrowBalance = 0
    let totalSupplyAprBalance = 0
    let totalBorrowAprBalance = 0
    let borrowingPower = 0
    let totalBorrowAvailable = 0

    for (const item of assetDeposits) {
      const ltv = item.emodeId === userEMode ? item.emodeBps / MAX_BPS : item.normaBps / MAX_BPS
      if (item.amountDeposit) {
        totalSupplyBalance += item.amountDeposit * item?.token?.price
        totalSupplyAprBalance +=
          item.amountDeposit * item?.token.price * ((item.supplyApy + item.stakingApr + item.incentiveSupplyApy) / 100)
        borrowingPower +=
          item.amountDeposit *
          item?.token?.price *
          (userEMode && item.emodeId === userEMode
            ? item.emodeLiquidationThresholdBps / MAX_BPS
            : item.liquidationThresholdBps / MAX_BPS)
        totalBorrowAvailable += item.amountDeposit * item?.token?.price * ltv
      }
    }
    for (const item of assetDebts) {
      if (item.debtAmount) {
        totalBorrowBalance += item.debtAmount * item?.token?.price
        totalBorrowAprBalance +=
          item.debtAmount * item?.token?.price * ((item.borrowApy - item.incentiveBorrowApy) / 100)
      }
    }
    return calculatorPosition(
      !isNaN(amount) ? amount * asset.token.price : 0,
      asset,
      mode,
      userEMode,
      assetDeposits,
      assetDebts,
    )
  }, [assetDebts, assetDeposits, mode, amount, asset, userEMode])

  const progressColor = riskFactor < 80 ? '#52A2FF' : riskFactor > 90 ? '#F04438' : riskFactor > 80 ? '#DC6803' : ''

  const progressEtColor =
    calculator.riskFactor < 80
      ? '#52A2FF'
      : calculator.riskFactor > 90
        ? '#F04438'
        : calculator.riskFactor > 80
          ? '#DC6803'
          : ''

  return (
    <div className={'space-y-2 mt-10'}>
      <div className={'flex justify-between'}>
        <div>Est. Risk Factor</div>
        <div className={'flex items-center gap-2'}>
          <div style={{ color: progressColor }} className={'flex items-center font-medium  gap-1'}>
            {formatNumberBalance(riskFactor, 2)}%
          </div>
          {amount > 0 && (
            <>
              <LeftToRightIcon />
              <div style={{ color: progressEtColor }} className={'flex items-center font-medium gap-1'}>
                {formatNumberBalance(calculator.riskFactor, 2)}%
              </div>
            </>
          )}
        </div>
      </div>
      {mode === ManageAssetMode.Supply && (
        <div className={'flex justify-between'}>
          <div>Supply APR</div>
          {etSupplyApy > 0 ? (
            <div className={'flex items-center gap-2'}>
              <div className={'flex items-center text-[#099250] font-medium gap-1'}>
                {formatNumberBalance(asset.supplyApy + asset.stakingApr + asset.incentiveSupplyApy, 2)}%
              </div>
              <LeftToRightIcon />
              <div className={'flex items-center text-[#099250] font-medium gap-1'}>
                {formatNumberBalance(etSupplyApy + asset.stakingApr, 2)}%
              </div>
            </div>
          ) : (
            <div className={'flex items-center text-[#099250] font-medium gap-1'}>
              {formatNumberBalance(asset.supplyApy + asset.stakingApr + asset.incentiveSupplyApy, 2)}%
            </div>
          )}
        </div>
      )}
      {mode === ManageAssetMode.Borrow && (
        <div className={'flex justify-between'}>
          <div>Borrow APR</div>
          <div className={'flex items-center gap-2'}>
            <div className={'flex items-center font-medium text-[#FF4D4F] gap-1'}>
              {formatNumberBalance(asset.borrowApy - asset.incentiveBorrowApy, 2)}%
            </div>
            {amount > 0 && (
              <>
                <LeftToRightIcon />
                <div className={'flex items-center font-medium text-[#FF4D4F] gap-1'}>
                  {formatNumberBalance(etBorrowApy, 2)}%
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
