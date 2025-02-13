import { ENV, envNane } from '@/common/consts'
import { Network } from '@aptos-labs/ts-sdk'

export const networkConfig = () => {
  const currentNetworkEnv: envNane = ENV as envNane
  let network: Network
  if (currentNetworkEnv === envNane.MAINNET) {
    // network = CONFIGS.mainnet;
    network = Network.MAINNET
  } else if (currentNetworkEnv === envNane.STG) {
    network = Network.MAINNET
  } else {
    network = Network.TESTNET
    //throw new Error('Invalid network env');
  }
  return network
}
