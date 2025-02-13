import { IsolateCollateral } from '@/common/components/Views/isolate/IsolateCollateral';
import { IsolateLiability } from '@/common/components/Views/isolate/IsolateLiability';
import { useIsolatePools } from '@/common/hooks/useIsolatePools';
import { formatNumberBalance, getRiskFactorColor } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { Card, Row, Typography } from 'antd';
import BigNumber from 'bignumber.js';
import React, { useEffect, useState } from 'react';

interface Props {
  pool: IsolatePools;
}

export const IsolateBox: React.FunctionComponent<Props> = ({ pool }) => {
  const [netBalance, setNetBalance] = useState(0);
  const [netApr, setNetApr] = useState(0);
  const { assetsAmounts, assetsDebts } = useIsolatePools();

  useEffect(() => {
    let totalSupplyBalance = 0;
    let totalBorrowBalance = 0;
    let totalSupplyAprBalance = 0;
    let totalBorrowAprBalance = 0;

    if (assetsAmounts.length == 0) return;

    const assetsDeposit = [];
    const assetsBorrow = [];

    for (const item of assetsAmounts) {
      const poolSupplyCollateral = pool.collateral.find(
        (x) => x.poolAddress === item.poolAddress && pool.position === item.position,
      ) as PoolAsset;
      const poolSupplyLiability = pool.liability.find(
        (x) => x.poolAddress === item.poolAddress && pool.position === item.position,
      ) as PoolAsset;

      if (poolSupplyCollateral) {
        assetsDeposit.push({
          ...poolSupplyCollateral,
          value: BigNumber(Number(item.value)).div(BigNumber(10).pow(poolSupplyCollateral.token.decimals)).toNumber(),
        });
      }
      if (poolSupplyLiability) {
        assetsDeposit.push({
          ...poolSupplyLiability,
          value: BigNumber(Number(item.value)).div(BigNumber(10).pow(poolSupplyLiability.token.decimals)).toNumber(),
        });
      }
    }

    for (const item of assetsDebts) {
      const poolData = pool.liability.find(
        (x) => x.poolAddress === item.poolAddress && pool.position === item.position,
      ) as PoolAsset;
      if (poolData) {
        assetsBorrow.push({
          ...poolData,
          value: BigNumber(Number(item.value))
            .div(BigNumber(10).pow(poolData?.token?.decimals))
            .toNumber(),
        });
      }
    }

    for (const item of assetsDeposit) {
      if (item.value && item) {
        totalSupplyBalance += item.value * item?.token?.price;
        totalSupplyAprBalance +=
          item.value * item?.token.price * ((item.supplyApy + item.stakingApr + item.incentiveSupplyApy) / 100);
      }
    }

    for (const item of assetsBorrow) {
      if (item.value) {
        totalBorrowBalance += item.value * item?.token?.price;
        totalBorrowAprBalance += item.value * item?.token?.price * ((item.borrowApy - item.incentiveBorrowApy) / 100);
      }
    }

    setNetBalance(totalSupplyBalance - totalBorrowBalance);
    const apr = ((totalSupplyAprBalance - totalBorrowAprBalance) / (totalSupplyBalance - totalBorrowBalance)) * 100;
    setNetApr(!isNaN(apr) ? apr : 0);
  }, [assetsDebts, assetsAmounts, pool]);

  const { data: riskFactor = 0 } = useQuery({
    queryKey: ['riskFactor', assetsDebts, assetsAmounts, pool],
    queryFn: () => {
      let borrowingPower = 0;
      let totalBorrow = 0;
      if (assetsAmounts.length == 0) {
        return 0;
      }
      if (assetsDebts.length == 0) {
        totalBorrow = 0;
      }

      for (const item of assetsAmounts) {
        const data = pool.collateral.find(
          (x) => x.poolAddress === item.poolAddress && pool.position === item.position,
        ) as PoolAsset;
        console.log('data11111111', data);
        if (data) {
          borrowingPower +=
            (BigNumber(Number(item.value)).div(BigNumber(10).pow(data.token.decimals)).toNumber() *
              data?.token?.price *
              data.liquidationThresholdBps) /
            10000;
        } else {
          borrowingPower += 0;
        }
      }
      for (const item of assetsDebts) {
        const data = pool.liability.find(
          (x) => x.poolAddress === item.poolAddress && pool.position === item.position,
        ) as PoolAsset;
        console.log('data2222222222', data);

        if (data) {
          totalBorrow +=
            BigNumber(Number(item.value)).div(BigNumber(10).pow(data.token.decimals)).toNumber() *
            Number(data?.token?.price);
        } else {
          totalBorrow += 0;
        }
      }
      console.log('totalBorrow', totalBorrow);
      console.log('borrowingPower', borrowingPower);
      return (totalBorrow / borrowingPower) * 100;
    },
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });

  return (
    <Card bordered={false} className={'border border-[#E4E7EC] rounded-[16px]'}>
      <div>
        <div className={'flex flex-col sm:flex-row gap-4 justify-between p-5 border-b border-[#E4E7EC]'}>
          <div className={'flex items-center gap-2'}>
            <div className={'flex items-center'}>
              <div className={'w-[32px]'}>
                <img
                  className={'w-[32px] h-auto'}
                  src={`https://image.meso.finance/${pool.collateral[0].token?.symbol.toLowerCase()}.png`}
                  alt={''}
                />
              </div>
              <div className={'w-[32px] -ml-1'}>
                <img
                  className={'w-[32px] h-auto'}
                  src={`https://image.meso.finance/${pool.liability[0].token?.symbol.toLowerCase()}.png`}
                  alt={''}
                />
              </div>
            </div>
            <Typography className={'text-[#344054] font-semibold'}>
              {pool.collateral[0].token.symbol}/{pool.liability[0].token.symbol}
            </Typography>
          </div>
          <div className={'flex items-center gap-5'}>
            <div className={'text-[#667085] font-medium'}>
              Risk factor:{' '}
              <span style={{ color: getRiskFactorColor(riskFactor) }} className={'font-semibold'}>
                {formatNumberBalance(riskFactor, 2)}%
              </span>
            </div>
            <div className={'w-[1px] h-[16px] bg-[#D0D5DD]'}></div>
            <div className={'text-[#667085] font-medium'}>
              Net Worth: <span className={'text-[#344054] font-medium'}>${formatNumberBalance(netBalance, 2)}</span>
            </div>
            <div className={'w-[1px] h-[16px] bg-[#D0D5DD]'}></div>

            <div className={'text-[#667085] font-medium'}>
              Net APR: <span className={'text-[#7F56D9] font-semibold'}>{netApr.toFixed(2)}%</span>
            </div>
          </div>
        </div>
        <Row>
          <IsolateCollateral pool={pool} collateral={pool.collateral[0]} />
          <IsolateLiability pool={pool} liability={pool.liability[0]} />
        </Row>
      </div>
    </Card>
  );
};
