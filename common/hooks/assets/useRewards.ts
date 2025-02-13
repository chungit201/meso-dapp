import { AssetsContext } from '@/common/context';
import { useAssets } from '@/common/hooks/assets/useAssets';
import { usePoxyServices } from '@/common/hooks/modules/poxy';
import { isAddress } from '@/utils';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useRouter } from 'next/router';
import { useContext, useMemo } from 'react';

export const useRewards = () => {
  const { allAssetsData } = useContext(AssetsContext);
  const { account } = useWallet();
  const { isFetching } = useAssets();
  const router = useRouter();
  const poxyService = usePoxyServices();

  const walletAddress = useMemo(
    () =>
      router.query.view_address && isAddress(router.query.view_address as string)
        ? router.query.view_address
        : account?.address,
    [account, router],
  );

  const { data: totalRewards = 0, refetch: refetchRewardPool } = useQuery({
    queryKey: ['getRewards', walletAddress, allAssetsData],
    queryFn: async () => {
      const res = await poxyService.pendingRewards(walletAddress as string);
      console.log('res', res);
      return BigNumber(Number(res[0])).div(BigNumber(10).pow(8)).toNumber();
    },
    enabled: !!walletAddress && !isFetching,
    refetchInterval: 10000,
  });

  return {
    totalRewards,
    refetchRewardPool,
  };
};
