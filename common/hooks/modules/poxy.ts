import useContract from '@/common/hooks/useContract'
import { POXY_ADDRESS } from '@/common/consts'

export const usePoxyServices = () => {
  const { view } = useContract()
  return {
    userWalletBalance: (typeArguments: any, functionArguments: any[]) => {
      return view({
        function: `${POXY_ADDRESS}::proxy::user_wallet_balance`,
        typeArguments,
        functionArguments,
      })
    },
    maxBorrowAmountPyth: (walletAddress: string) => {
      return view({
        function: `${POXY_ADDRESS}::proxy::max_borrowable_amount_pyth`,
        typeArguments: [],
        functionArguments: [walletAddress],
      })
    },
    maxBorrowAmountSwitchboard: (walletAddress: string) => {
      return view({
        function: `${POXY_ADDRESS}::proxy::max_borrowable_amount_switchboard`,
        typeArguments: [],
        functionArguments: [walletAddress],
      })
    },
    pendingRewards: (walletAddress: string) => {
      return view({
        function: `${POXY_ADDRESS}::proxy::pending_rewads`,
        typeArguments: [],
        functionArguments: [walletAddress],
      })
    },
  }
}
