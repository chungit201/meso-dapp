import useNetworkConfiguration from '@/common/hooks/useNetwork'
import { Provider, FungibleAssetClient } from 'aptos'
import useClient from '@/common/hooks/useClient'

export enum CoinType {
  COIN = 'COIN',
  FUNGIBLE_ASSETS = 'FUNGIBLE_ASSET',
}

const useBalanceToken = () => {
  const { networkCfg } = useNetworkConfiguration()
  const { aptos } = useClient()
  const provider = new Provider(networkCfg.toLocaleLowerCase() || ('testnet' as any))

  const getBalanceCoin = async (token: Token, address: string) => {
    try {
      if (token && address) {
        if (token.type === CoinType.COIN) {
          const TodoListResource: any = await aptos.getAccountResource({
            accountAddress: address as any,
            resourceType: `0x1::coin::CoinStore<${token.address}>`,
          })
          return Number(TodoListResource.coin.value)
        } else {
          const fungibleAsset = new FungibleAssetClient(provider)
          const balance = await fungibleAsset.getPrimaryBalance(address, token.address)
          return Number(balance)
        }
      } else {
        return 0
      }
    } catch (e) {
      return 0
    }
  }
  return { getBalanceCoin }
}

export default useBalanceToken
