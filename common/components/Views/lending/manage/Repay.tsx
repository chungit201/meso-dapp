import { CalculatorPosition } from '@/common/components/CaculaterPosition';
import InputCurrency from '@/common/components/InputCurrentcy';
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets';
import { AssetManageProps } from '@/common/components/Views/lending/manage/Deposit';
import { MAX_u64, MESO_ADDRESS } from '@/common/consts';
import { AssetsContext } from '@/common/context';
import { useAssets } from '@/common/hooks/assets/useAssets';
import useTransactionCallback from '@/common/hooks/assets/useTransactionCallback';
import { CoinType } from '@/common/hooks/useBalanceToken';
import { roundDown } from '@/utils';
import { InputEntryFunctionData } from '@aptos-labs/ts-sdk';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'antd';
import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useMemo, useState } from 'react';

export const Repay: React.FunctionComponent<AssetManageProps> = ({ asset, balance, handleClose, setAssetSelected }) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');
  const transactionCallback = useTransactionCallback();
  const { assetDebts, refetch, refetchDebt } = useAssets();
  const { refetchAllAssetData } = useContext(AssetsContext);
  useEffect(() => {
    setError('');
  }, [amount]);

  useEffect(() => {
    setAmount(0);
  }, []);

  const { data: totalRepay = 0, refetch: refetchBorrowAmount } = useQuery({
    queryKey: ['totalRepay', asset, assetDebts],
    queryFn: async () => {
      const item = assetDebts.find((x) => x.poolAddress === asset.poolAddress);
      return item?.debtAmount ?? 0;
    },
    enabled: !!asset,
    refetchIntervalInBackground: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const isMax = useMemo(() => {
    return amount === totalRepay;
  }, [amount, totalRepay]);

  const handleChange = (value: number) => {
    setAmount(value);
  };

  const validate = () => {
    if (amount > balance) {
      setError(`Insufficient balance of ${asset.token.symbol}`);
      return false;
    }
    if (amount === 0) {
      setError('The amount must be above zero');

      return false;
    }
    return true;
  };

  const handleRepay = async () => {
    if (!validate()) return;
    try {
      const repayAmount = isMax
        ? MAX_u64
        : BigNumber(roundDown(amount, asset.token.decimals)).times(BigNumber(10).pow(asset.token.decimals)).toNumber();

      let payload = {};
      if (asset.token.type === CoinType.COIN) {
        payload = {
          function: `${MESO_ADDRESS}::meso::repay_coin`,
          typeArguments: [asset?.token.address as string],
          functionArguments: [repayAmount],
        };
      } else {
        payload = {
          function: `${MESO_ADDRESS}::meso::repay`,
          typeArguments: [],
          functionArguments: [asset?.token.address, repayAmount],
        };
      }
      transactionCallback({
        payload: payload as InputEntryFunctionData,
        onSuccess(hash: string) {
          setTimeout(() => {
            refetch();
            refetchBorrowAmount();
            refetchDebt();
            refetchAllAssetData();
            setAmount(0);
          }, 1000);
        },
        setLoading,
      });
    } catch (e) {
      console.log('e', e);
    }
  };

  return (
    <div className={'mt-2'}>
      <InputCurrency
        label={'Borrowed'}
        placeholder={'0.00'}
        inputAmount={amount > 0 ? amount.toString() : ''}
        onInputChange={handleChange}
        asset={asset}
        max={balance < totalRepay ? balance : totalRepay}
        balance={totalRepay}
        keepApt={asset.token.symbol === 'APT' && balance < totalRepay}
        setAssetSelected={setAssetSelected}
        assets={assetDebts}
        maxDecimals={asset.token.decimals}
      />
      <CalculatorPosition asset={asset} amount={Number(amount)} mode={ManageAssetMode.Repay} />
      {/*<div className={'mt-10 space-y-4'}>*/}
      {/*  <div className={'flex justify-between text-[#737b94]'}>*/}
      {/*    <div>Wallet</div>*/}
      {/*    <div>*/}
      {/*      {formatNumberBalance(balance, 4)} {asset?.token.symbol}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      {error && <p className={'text-red-500 text-center mt-3'}>{error}</p>}
      <Button
        loading={loading}
        disabled={loading}
        onClick={handleRepay}
        className={'w-full mt-8 bg-[#7F56D9] border-0 text-[#fff] font-semibold h-11 rounded-full'}
      >
        Repay
      </Button>
    </div>
  );
};
