import { MAX_BPS } from '@/common/consts'

export const getAssetInfo = (pools: PoolAsset[], address: string) => {
  const asset = pools.find((asset) => asset.token.address === address)
  return asset
}

export const getAssetInfoByPoolAddress = (pools: PoolAsset[], address: string) => {
  const asset = pools.find((asset) => standardizeAddress(asset.poolAddress) === standardizeAddress(address))
  return asset
}

export const getAssetInfoBySymbol = (pools: PoolAsset[], symbol: string) => {
  const asset = pools.find((asset) => asset.token.symbol.toLowerCase() === symbol.toLowerCase())
  return asset as PoolAsset
}

export const standardizeAddress = (address: string): string => {
  // Convert the address to lowercase
  const lowercaseAddress = address.toLowerCase()
  // Remove the "0x" prefix if present
  const addressWithoutPrefix = lowercaseAddress.startsWith('0x') ? lowercaseAddress.slice(2) : lowercaseAddress
  // Pad the address with leading zeros if necessary
  // to ensure it has exactly 64 characters (excluding the "0x" prefix)
  const addressWithPadding = addressWithoutPrefix.padStart(64, '0')
  // Return the standardized address with the "0x" prefix
  return `0x${addressWithPadding}`
}

export const getBorrowRate = (currUtilization: number, poolState: PoolAsset): number => {
  if (currUtilization === 0) {
    return poolState.baseBps
  }
  const optimalUtilization = poolState.optimalUtilizationBps
  if (currUtilization * MAX_BPS === optimalUtilization) {
    return poolState.optimalBps
  } else if (currUtilization * MAX_BPS < optimalUtilization) {
    return (
      poolState.baseBps + ((poolState.optimalBps - poolState.baseBps) * currUtilization * MAX_BPS) / optimalUtilization
    )
  } else {
    return (
      poolState.optimalBps +
      ((poolState.maxBps - poolState.optimalBps) * (currUtilization * MAX_BPS - optimalUtilization)) /
        (MAX_BPS - optimalUtilization)
    )
  }
}
