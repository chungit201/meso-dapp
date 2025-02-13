import { MAX_BPS } from '@/common/consts';
import { AssetsContext } from '@/common/context';
import { useAssets } from '@/common/hooks/assets/useAssets';
import useUser from '@/common/hooks/useUser';
import BigNumber from 'bignumber.js';
import { useContext, useEffect, useMemo, useState } from 'react';

export const useDashboard = () => {
  const { assetDeposits, assetDebts } = useAssets();
  const [netBalance, setNetBalance] = useState(0);
  const [netApr, setNetApr] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [totalBorrow, setTotalBorrow] = useState(0);
  const { allAssetsData } = useContext(AssetsContext);
  const { userEMode } = useUser();

  useEffect(() => {
    let totalSupplyBalance = 0;
    let totalBorrowBalance = 0;
    let totalAvailableBalance = 0;
    for (const item of allAssetsData) {
      totalSupplyBalance +=
        BigNumber(item.poolSupply).div(BigNumber(10).pow(item.token.decimals)).toNumber() * item.token.price;
      totalBorrowBalance +=
        BigNumber(item.totalDebt).div(BigNumber(10).pow(item.token.decimals)).toNumber() * item.token.price;
      totalAvailableBalance +=
        BigNumber(item.totalReserves - item.totalFees)
          .div(BigNumber(10).pow(item.token.decimals))
          .toNumber() * item.token.price;
    }
    setTotalSupply(totalSupplyBalance);
    setTotalAvailable(totalAvailableBalance);
    setTotalBorrow(totalBorrowBalance);
  }, [allAssetsData]);

  const borrowPower = useMemo(() => {
    if (assetDebts.length === 0 || assetDeposits.length === 0) return Number(0).toFixed(0);
    let totalBorrowAvailable = 0;
    let totalDebt = 0;

    for (const item of assetDeposits) {
      const ltv = item.emodeId === userEMode ? item.emodeBps / MAX_BPS : item.normaBps / MAX_BPS;
      if (item.amountDeposit) {
        totalBorrowAvailable += item.amountDeposit * item?.token?.price * ltv;
      }
    }
    for (const item of assetDebts) {
      if (item.debtAmount) {
        totalDebt += item.debtAmount * item?.token?.price;
      }
    }

    return Number((totalDebt / totalBorrowAvailable) * 100).toFixed(0);
  }, [assetDebts, assetDeposits, userEMode]);

  const marketBorrowPower = useMemo(() => {
    let totalSupplyBps = 0;
    let totalDebt = 0;
    for (const item of allAssetsData) {
      totalSupplyBps += (item.poolSupply / 10 ** item.token.decimals) * item?.token?.price * (item.normaBps / 10000);
    }
    for (const item of allAssetsData) {
      totalDebt += (item.totalDebt / 10 ** item.token.decimals) * item?.token?.price;
    }
    return Number((totalDebt / totalSupplyBps) * 100).toFixed(0);
  }, [allAssetsData]);

  useEffect(() => {
    let totalSupplyBalance = 0;
    let totalBorrowBalance = 0;
    let totalSupplyAprBalance = 0;
    let totalBorrowAprBalance = 0;

    for (const item of assetDeposits) {
      if (item.amountDeposit) {
        totalSupplyBalance += item.amountDeposit * item?.token?.price;
        totalSupplyAprBalance +=
          item.amountDeposit * item?.token.price * ((item.supplyApy + item.stakingApr + item.incentiveSupplyApy) / 100);
      }
    }

    for (const item of assetDebts) {
      if (item.debtAmount) {
        totalBorrowBalance += item.debtAmount * item?.token?.price;
        totalBorrowAprBalance +=
          item.debtAmount * item?.token?.price * ((item.borrowApy - item.incentiveBorrowApy) / 100);
      }
    }

    setNetBalance(totalSupplyBalance - totalBorrowBalance);
    setNetApr(((totalSupplyAprBalance - totalBorrowAprBalance) / (totalSupplyBalance - totalBorrowBalance)) * 100);
  }, [assetDebts, assetDeposits]);

  return {
    netBalance,
    netApr,
    totalSupply,
    totalBorrow,
    totalAvailable,
    marketBorrowPower,
    borrowPower,
  };
};
