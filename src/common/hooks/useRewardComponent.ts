import useContract from '@/common/hooks/useContract'
import { MESO_ADDRESS } from '@/common/consts'

export const useRewardComponent = () => {
  const { view } = useContract()

  const getRewardRate = async (rewardPoolAddress: string) => {
    try {
      const data: any = await view({
        function: `${MESO_ADDRESS}::rewards_pool::reward_rate`,
        typeArguments: [],
        functionArguments: [rewardPoolAddress],
      })
      return Number(data[0])
    } catch (e) {
      return 0
    }
  }

  const getTotalStake = async (rewardPoolAddress: string) => {
    try {
      const data: any = await view({
        function: `${MESO_ADDRESS}::rewards_pool::total_stake`,
        typeArguments: [],
        functionArguments: [rewardPoolAddress],
      })
      return Number(data[0])
    } catch (e) {
      return 0
    }
  }
  return { getRewardRate, getTotalStake }
}
