type Token = {
  address: string
  decimals: number
  name: string
  symbol: string
  price: number
  wrapAddress: string
  type: string
  priceChange: number
}

type PoolAsset = {
  baseBps: number
  borrowApy: number
  borrowFeeBps: number
  borrowRewardsPool: string
  closeFactorBps: number
  createdAt: string
  emodeBps: number
  emodeId: string
  fungibleAsset: string
  isPaused: boolean
  lastUpdatedTimestamp: number
  liquidationFeeBps: number
  maxBps: number
  normaBps: number
  optimalBps: number
  optimalUtilizationBps: number
  poolAddress: string
  poolSupply: number
  protocolInterestFeeBps: number
  protocolLiquidationFeeBps: number
  supplyApy: number
  supplyCap: number
  supplyRewardsPool: string
  token: Token
  tokenAddress: string
  totalDebt: number
  totalDebtShares: number
  totalFees: number
  totalReserves: number
  totalSupplyShares: number
  updatedAt: string
  _id: string
  walletBalance: number
  amountDeposit: number
  debtAmount: number
  incentiveSupplyApy: number
  incentiveBorrowApy: number
  borrowCap: number
  emodeLiquidationThresholdBps: number
  liquidationThresholdBps: number
  totalBorrowAvailable: number
  stakingApr: number
  amountChange: number
  isolatedKey?: string
}

type IsolatePools = {
  position: string
  collateral: PoolAsset[]
  liability: PoolAsset[]
  isolatedKey: string
}
