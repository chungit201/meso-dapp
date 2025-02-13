import { MAX_BPS } from '@/common/consts';
import { AssetsContext } from '@/common/context';
import { useAssets } from '@/common/hooks/assets/useAssets';
import { getAssetInfoBySymbol } from '@/utils/assets';
import { Strategy, StrategyType, strategiesPairs } from '@/utils/stategies';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useContext, useEffect, useState } from 'react';

export const useStrategies = () => {
  const [data, setData] = useState<Strategy[]>([]);
  const { allAssetsData, isLoading } = useContext(AssetsContext);
  const { assetDebts, assetDeposits } = useAssets();
  const { account } = useWallet();
  const getUserPosition = async (pair: Strategy, accountAddress: string) => {
    const assetSupply = assetDeposits.find((asset) => asset.token.symbol === pair.asset0.token.symbol);
    const assetBorrow = assetDebts.find((asset) => asset.token.symbol === pair.asset1.token.symbol);

    let amountDeposited = 0;
    let totalSupplied = 0;
    let totalDebt = 0;

    if (assetSupply && assetBorrow) {
      totalSupplied = assetSupply.amountDeposit;
      totalDebt = assetBorrow.debtAmount;
      amountDeposited = totalSupplied * assetSupply.token.price - totalDebt * assetBorrow.token.price;
    }

    return {
      ...pair,
      totalSupplied,
      amountDeposited,
      totalDebt,
    };
  };

  const { data: strategies = [], refetch } = useQuery({
    queryKey: ['Strategies', allAssetsData, strategiesPairs, assetDeposits, assetDebts],
    queryFn: async () => {
      const data = strategiesPairs.map((pair) => {
        const asset0 = getAssetInfoBySymbol(allAssetsData, pair.tokenA);
        const asset1 = getAssetInfoBySymbol(allAssetsData, pair.tokenB);
        const totalBorrowAvailable = BigNumber(asset1.borrowCap - asset1.totalDebt)
          .div(BigNumber(10).pow(asset1.token.decimals))
          .toNumber();

        return {
          asset0,
          asset1,
          type: pair.tokenA === pair.tokenB ? StrategyType.STABLE : StrategyType.LSD,
          maxApr: calculateMaxApr(asset0, asset1),
          totalAvailable: totalBorrowAvailable > 0 ? totalBorrowAvailable : 0,
          netApr: 0,
          riskFactor: 0,
          totalSupplied: 0,
          totalBorrowed: 0,
          status: pair.status,
        } as Strategy;
      });

      const tasks = [];
      const mappingData = [];

      for (const pair of data) {
        tasks.push(getUserPosition(pair, account?.address as string));
      }
      const results: any = await Promise.allSettled(tasks);
      for (const result of results) {
        if (result.status === 'fulfilled') {
          mappingData.push(result.value);
        } else {
          mappingData.push({
            ...data[results.indexOf(result)],
            totalSupplied: 0,
            amountDeposited: 0,
            totalDebt: 0,
            userLeverage: 0,
          });
        }
      }
      return mappingData;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (strategies.length > 0) {
      setData(strategies);
    }
  }, [strategies]);

  const calculateMaxApr = (asset0: PoolAsset, asset1: PoolAsset) => {
    try {
      const supplyAmount = 10; // fixed supply amount
      const borrowAmount = (10 * asset1.emodeBps) / MAX_BPS; // max borrow amount
      const totalSupplyBalance = supplyAmount * asset0.token.price;
      const totalBorrowBalance = borrowAmount * asset1.token.price;

      const totalSupplyAprBalance =
        totalSupplyBalance * ((asset0.supplyApy + asset0.stakingApr + asset0.incentiveSupplyApy) / 100);
      const totalBorrowAprBalance = totalBorrowBalance * ((asset1.borrowApy - asset1.incentiveBorrowApy) / 100);

      return ((totalSupplyAprBalance - totalBorrowAprBalance) / (totalSupplyBalance - totalBorrowBalance)) * 100;
    } catch (e) {
      console.log(e);
      return 0;
    }
  };

  return { strategies: data, isLoading, refetch };
};
