import { MAX_BPS } from '@/common/consts'
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets'

export const calculatorNetApr = (assetDeposits: PoolAsset[], assetDebts: PoolAsset[], tokens: Token[] = []) => {
  let totalSupplyBalance = 0
  let totalBorrowBalance = 0
  let totalSupplyAprBalance = 0
  let totalBorrowAprBalance = 0
  if (assetDeposits.length === 0) return 0
  for (const item of assetDeposits) {
    const tokenPrice = tokens.find((x) => x.address === item.token.address)?.priceChange ?? 0
    if (item.amountChange) {
      totalSupplyBalance += item.amountChange * tokenPrice
      totalSupplyAprBalance +=
        item.amountChange * tokenPrice * ((item.supplyApy + item.stakingApr + item.incentiveSupplyApy) / 100)
    }
  }

  for (const item of assetDebts) {
    const tokenPrice = tokens.find((x) => x.address === item.token.address)?.priceChange ?? 0
    if (item.amountChange) {
      totalBorrowBalance += item.amountChange * tokenPrice
      totalBorrowAprBalance += item.amountChange * tokenPrice * ((item.borrowApy - item.incentiveBorrowApy) / 100)
    }
  }

  return ((totalSupplyAprBalance - totalBorrowAprBalance) / (totalSupplyBalance - totalBorrowBalance)) * 100
}

export const getBorrowRate = (currUtilization: number, poolState: PoolAsset): number => {
  if (currUtilization === 0) {
    return poolState.baseBps
  }
  const optimalUtilization = poolState.optimalUtilizationBps
  if (currUtilization === optimalUtilization) {
    return poolState.optimalBps
  } else if (currUtilization < optimalUtilization) {
    return poolState.baseBps + ((poolState.optimalBps - poolState.baseBps) * currUtilization) / optimalUtilization
  } else {
    return (
      poolState.optimalBps +
      ((poolState.maxBps - poolState.optimalBps) * (currUtilization - optimalUtilization)) /
        (MAX_BPS - optimalUtilization)
    )
  }
}

export const calculatorPosition = (
  balance: number,
  asset: PoolAsset,
  mode: ManageAssetMode,
  userEMode: string,
  assetDeposits: PoolAsset[],
  assetDebts: PoolAsset[],
): { netBalance: number; netApr: number; riskFactor: number; borrowingPower: number } => {
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
      totalBorrowAprBalance += item.debtAmount * item?.token?.price * ((item.borrowApy - item.incentiveBorrowApy) / 100)
    }
  }

  const amountChangeSupplyApr = balance * ((asset.supplyApy + asset.stakingApr + asset.incentiveSupplyApy) / 100)
  const amountChangeBorrowApr = balance * ((asset.borrowApy - asset.incentiveBorrowApy) / 100)
  const borrowingPowerAmountChange =
    balance *
    (userEMode && asset.emodeId === userEMode
      ? asset.emodeLiquidationThresholdBps / 10000
      : asset.liquidationThresholdBps / 10000)

  switch (mode) {
    case ManageAssetMode.Supply:
      return {
        netBalance: totalSupplyBalance + balance - totalBorrowBalance,
        netApr:
          ((totalSupplyAprBalance + amountChangeSupplyApr - totalBorrowAprBalance) /
            (totalSupplyBalance + balance - totalBorrowBalance)) *
          100,
        riskFactor: (totalBorrowBalance / (borrowingPower + borrowingPowerAmountChange)) * 100,
        borrowingPower: (totalBorrowBalance / totalBorrowAvailable) * 100,
      }
    case ManageAssetMode.Withdraw:
      return {
        netBalance: totalSupplyAprBalance - balance - totalBorrowBalance,
        netApr:
          ((totalSupplyAprBalance - amountChangeSupplyApr - totalBorrowAprBalance) /
            (totalSupplyAprBalance - balance - totalBorrowBalance)) *
          100,
        riskFactor: (totalBorrowBalance / (borrowingPower - borrowingPowerAmountChange)) * 100,
        borrowingPower: (totalBorrowBalance / totalBorrowAvailable) * 100,
      }
    case ManageAssetMode.Borrow:
      return {
        netBalance: totalSupplyAprBalance - totalBorrowBalance + balance,
        netApr:
          ((totalSupplyAprBalance - totalBorrowAprBalance + amountChangeBorrowApr) /
            (totalSupplyAprBalance - totalBorrowBalance + balance)) *
          100,
        riskFactor: ((totalBorrowBalance + balance) / borrowingPower) * 100,
        borrowingPower: (totalBorrowBalance / totalBorrowAvailable) * 100,
      }
    case ManageAssetMode.Repay:
      return {
        netBalance: totalSupplyAprBalance + balance - totalBorrowBalance - balance,
        netApr:
          ((totalSupplyAprBalance + amountChangeSupplyApr - totalBorrowAprBalance - amountChangeBorrowApr) /
            (totalSupplyAprBalance + balance - totalBorrowBalance - balance)) *
          100,
        riskFactor: ((totalBorrowBalance - balance) / borrowingPower) * 100,
        borrowingPower: (totalBorrowBalance / totalBorrowAvailable) * 100,
      }
  }
}

const calculateApr = (pool: PoolAsset) => {
  // const compounding = 365; // compound daily
  const MAX_BPS_U128 = 10000
  const curr_utilization = pool.totalDebt / pool.poolSupply

  const borrowRate = getBorrowRate(curr_utilization, pool)
  const accrued_interest = (pool.totalDebt * borrowRate) / MAX_BPS_U128

  let borrowApr = 0
  let supplyApr = 0
  const borrowApy = 0
  const supplyApy = 0

  if (pool.totalDebt == 0) {
    return { borrowApy, supplyApy }
  }

  borrowApr = (accrued_interest / pool.totalDebt) * 100
  // borrowApy = ((1 + borrowApr / compounding / 100) ** compounding - 1) * 100;

  const fees = (accrued_interest * pool.protocolInterestFeeBps) / MAX_BPS_U128

  supplyApr = ((accrued_interest - fees) / pool.poolSupply) * 100
  // supplyApy = ((1 + supplyApr / compounding / 100) ** compounding - 1) * 100;

  return { borrowApy: borrowApr, supplyApy: supplyApr }
}
