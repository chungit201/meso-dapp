import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets';
import { ISOLATE_ADDRESS, MAX_BPS } from '@/common/consts';
import useContract from '@/common/hooks/useContract';
import { poolService } from '@/common/services/pools';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';

export const useIsolatePools = () => {
  const { account } = useWallet();
  const { view } = useContract();

  const {
    data: { userPools = [], isolatePools = [] } = {},
    isFetching: isFetchingPools,
    refetch: refetchPosition,
  } = useQuery({
    queryKey: ['IsolatePools', account],
    queryFn: async () => {
      const { data } = await poolService.getIsolatePools();
      const pools = data as IsolatePools[];
      const newData = [];
      if (account) {
        const { data: positions } = await poolService.getUserPositions(account?.address as string);
        for (const item of pools) {
          const userPositions = positions.filter((x: any) => x.isolatedKey === item.isolatedKey);
          if (userPositions.length > 0) {
            for (const position of userPositions) {
              newData.push({ ...item, position: position?.position });
            }
          } else {
            newData.push({ ...item, position: '' });
          }
        }
      } else {
        for (const item of pools) {
          newData.push({ ...item, position: '' });
        }
      }

      return { userPools: newData as IsolatePools[], isolatePools: data };
    },
  });

  const {
    data: { userPositions = [], assetsAmounts = [], assetsDebts = [] } = {},
    isFetching: isFetchingUserPositions,
    refetch: refetchUserPosition,
  } = useQuery({
    queryKey: ['UserPositions', account],
    queryFn: async () => {
      const { data } = await poolService.getUserPositions(account?.address as string);
      const tasks1 = [];
      const tasks2 = [];
      const assetsAmounts: any = [];
      const assetsDebts: any = [];
      for (const position of data) {
        tasks1.push(getAssetsAmount(position.position));
      }
      for (const position of data) {
        tasks2.push(getAssetsDebts(position.position));
      }
      const results1: any = await Promise.all(tasks1);
      const results2: any = await Promise.all(tasks2);

      for (const result of results1) {
        for (const res of result) {
          assetsAmounts.push(res);
        }
      }

      for (const result of results2) {
        for (const res of result) {
          assetsDebts.push(res);
        }
      }

      return { userPositions: data, assetsAmounts, assetsDebts };
    },
    enabled: !!account?.address,
  });

  const getAssetsDebts = async (position: string) => {
    try {
      const res: any = (
        await view({
          function: `${ISOLATE_ADDRESS}::lending_pool::debt_amounts`,
          typeArguments: [],
          functionArguments: [position],
        })
      )[0];
      return res.data.map((x: any) => {
        return { poolAddress: x.key.inner, value: x.value, position };
      });
    } catch (e) {
      console.log(e);
    }
  };

  const getAssetsAmount = async (position: string) => {
    try {
      const res: any = (
        await view({
          function: `${ISOLATE_ADDRESS}::lending_pool::asset_amounts`,
          typeArguments: [],
          functionArguments: [position],
        })
      )[0];

      return res.data.map((x: any) => {
        return { poolAddress: x.key.inner, value: Number(x.value), position };
      });
    } catch (e) {
      console.log(e);
    }
  };

  const getRiskFactor = (assetsAmounts: any[], assetsDebts: any[], isolatePool: IsolatePools) => {
    let borrowingPower = 0;
    let totalBorrow = 0;
    if (assetsAmounts.length == 0) {
      return 0;
    }
    if (assetsDebts.length == 0) {
      totalBorrow = 0;
    }
    for (const item of assetsAmounts) {
      const asset = isolatePool.collateral.find(
        (x) => x.poolAddress === item.poolAddress && item.position === isolatePool.position,
      ) as PoolAsset;
      if (asset) {
        borrowingPower +=
          BigNumber(Number(item.value)).div(BigNumber(10).pow(asset.token.decimals)).toNumber() *
          asset?.token?.price *
          (asset?.liquidationThresholdBps / 10000);
      }
    }
    for (const item of assetsDebts) {
      const asset = isolatePool.liability.find(
        (x) => x.poolAddress === item.poolAddress && item.position === isolatePool.position,
      ) as PoolAsset;
      if (asset) {
        totalBorrow +=
          BigNumber(Number(item.value)).div(BigNumber(10).pow(asset.token.decimals)).toNumber() *
          Number(asset?.token?.price);
      }
    }

    return (totalBorrow / borrowingPower) * 100;
  };

  const calculatorPosition = (
    balance: number,
    asset: PoolAsset,
    mode: ManageAssetMode,
    assetDeposits: any[],
    assetDebts: any[],
    isolatePool: IsolatePools,
  ): { netBalance: number; netApr: number; riskFactor: number; borrowingPower: number } => {
    let totalSupplyBalance = 0;
    let totalBorrowBalance = 0;
    let totalSupplyAprBalance = 0;
    let totalBorrowAprBalance = 0;
    let borrowingPower = 0;
    let totalBorrowAvailable = 0;

    for (const item of assetDeposits) {
      const asset = isolatePool.collateral.find((x) => x.poolAddress === item.poolAddress) as PoolAsset;

      if (asset) {
        const ltv = asset.normaBps / MAX_BPS;

        totalSupplyBalance += Number(item.value) * asset?.token?.price;
        totalSupplyAprBalance +=
          BigNumber(Number(item.value)).div(BigNumber(10).pow(asset.token.decimals)).toNumber() *
          asset?.token.price *
          ((asset.supplyApy + asset.stakingApr + asset.incentiveSupplyApy) / 100);
        borrowingPower +=
          BigNumber(Number(item.value)).div(BigNumber(10).pow(asset.token.decimals)).toNumber() *
          asset?.token?.price *
          (asset.liquidationThresholdBps / MAX_BPS);
        totalBorrowAvailable +=
          BigNumber(Number(item.value)).div(BigNumber(10).pow(asset.token.decimals)).toNumber() *
          asset?.token?.price *
          ltv;
      }
    }
    for (const item of assetDebts) {
      const asset = isolatePool.liability.find((x) => x.poolAddress === item.poolAddress) as PoolAsset;
      if (asset) {
        totalBorrowBalance +=
          BigNumber(Number(item.value)).div(BigNumber(10).pow(asset.token.decimals)).toNumber() * asset?.token?.price;
        totalBorrowAprBalance +=
          BigNumber(Number(item.value)).div(BigNumber(10).pow(asset.token.decimals)).toNumber() *
          asset?.token?.price *
          ((asset.borrowApy - asset.incentiveBorrowApy) / 100);
      }
    }

    const amountChangeSupplyApr = balance * ((asset.supplyApy + asset.stakingApr + asset.incentiveSupplyApy) / 100);
    const amountChangeBorrowApr = balance * ((asset.borrowApy - asset.incentiveBorrowApy) / 100);
    const borrowingPowerAmountChange = balance * (asset.liquidationThresholdBps / 10000);

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
        };
      case ManageAssetMode.Withdraw:
        return {
          netBalance: totalSupplyAprBalance - balance - totalBorrowBalance,
          netApr:
            ((totalSupplyAprBalance - amountChangeSupplyApr - totalBorrowAprBalance) /
              (totalSupplyAprBalance - balance - totalBorrowBalance)) *
            100,
          riskFactor: (totalBorrowBalance / (borrowingPower - borrowingPowerAmountChange)) * 100,
          borrowingPower: (totalBorrowBalance / totalBorrowAvailable) * 100,
        };
      case ManageAssetMode.Borrow:
        return {
          netBalance: totalSupplyAprBalance - totalBorrowBalance + balance,
          netApr:
            ((totalSupplyAprBalance - totalBorrowAprBalance + amountChangeBorrowApr) /
              (totalSupplyAprBalance - totalBorrowBalance + balance)) *
            100,
          riskFactor: ((totalBorrowBalance + balance) / borrowingPower) * 100,
          borrowingPower: (totalBorrowBalance / totalBorrowAvailable) * 100,
        };
      case ManageAssetMode.Repay:
        return {
          netBalance: totalSupplyAprBalance + balance - totalBorrowBalance - balance,
          netApr:
            ((totalSupplyAprBalance + amountChangeSupplyApr - totalBorrowAprBalance - amountChangeBorrowApr) /
              (totalSupplyAprBalance + balance - totalBorrowBalance - balance)) *
            100,
          riskFactor: ((totalBorrowBalance - balance) / borrowingPower) * 100,
          borrowingPower: (totalBorrowBalance / totalBorrowAvailable) * 100,
        };
    }
  };

  const refetch = async () => {
    await refetchUserPosition();
    await refetchPosition();
  };

  return {
    isolatePools,
    userPools,
    isFetchingPools,
    userPositions,
    refetchUserPosition: refetch,
    isFetchingUserPositions,
    assetsAmounts,
    assetsDebts,
    getRiskFactor,
    calculatorPosition,
  };
};
