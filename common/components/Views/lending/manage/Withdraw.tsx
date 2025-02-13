import { CalculatorPosition } from '@/common/components/CaculaterPosition';
import InputCurrency from '@/common/components/InputCurrentcy';
import { ManageAssetMode } from '@/common/components/Modals/ModalManageAssets';
import { AssetManageProps } from '@/common/components/Views/lending/manage/Deposit';
import { MAX_u64, MESO_ADDRESS } from '@/common/consts';
import { AssetsContext } from '@/common/context';
import { useAssets } from '@/common/hooks/assets/useAssets';
import useTransactionCallback from '@/common/hooks/assets/useTransactionCallback';
import { CoinType } from '@/common/hooks/useBalanceToken';
import useContract from '@/common/hooks/useContract';
import { InputEntryFunctionData } from '@aptos-labs/ts-sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from 'antd';
import BigNumber from 'bignumber.js';
import React, { useContext, useEffect, useMemo, useState } from 'react';

export const Withdraw: React.FunctionComponent<AssetManageProps> = ({
  asset,
  balance,
  handleClose,
  setAssetSelected,
}) => {
  const { refetchAllAssetData } = useContext(AssetsContext);
  const { assetDeposits } = useAssets();

  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');

  const transactionCallback = useTransactionCallback();
  const { view } = useContract();
  const { account } = useWallet();
  const { refetch } = useAssets();

  useEffect(() => {
    setAmount(0);
  }, []);

  const { data: totalWithdrawAvailable = 0, refetch: refetchWithdrawAmount } = useQuery({
    queryKey: ['totalWithdrawAvailable', asset],
    queryFn: async () => {
      if (!asset) {
        return 0;
      }
      const res: any = await view({
        function: `${MESO_ADDRESS}::lending_pool::remaining_withdrawable_amount`,
        typeArguments: [],
        functionArguments: [account?.address, asset.poolAddress],
      });
      return BigNumber(Number(res[0])).div(BigNumber(10).pow(asset.token.decimals)).toNumber();
    },
  });

  const isMax = useMemo(() => {
    return amount === totalWithdrawAvailable;
  }, [totalWithdrawAvailable, amount]);

  useEffect(() => {
    setError('');
  }, [amount]);

  const handleChange = (value: number) => {
    setAmount(value);
  };

  const handleWithdraw = async () => {
    if (amount === 0) {
      setError('The amount must be above zero');
      return;
    }
    try {
      const withdrawAmount = isMax
        ? MAX_u64
        : BigNumber(amount).times(BigNumber(10).pow(asset.token.decimals)).toString();

      let payload = {};
      if (asset.token.type === CoinType.COIN) {
        payload = {
          function: `${MESO_ADDRESS}::meso::withdraw_coin`,
          typeArguments: [asset?.token.address as string],
          functionArguments: [withdrawAmount],
        };
      } else {
        payload = {
          function: `${MESO_ADDRESS}::meso::withdraw`,
          typeArguments: [],
          functionArguments: [
            asset?.token.address,
            BigNumber(amount).times(BigNumber(10).pow(asset.token.decimals)).toString(),
          ],
        };
      }
      transactionCallback({
        payload: payload as InputEntryFunctionData,
        onSuccess(hash: string) {
          setTimeout(async () => {
            await refetch();
            refetchAllAssetData();
            await refetchWithdrawAmount();
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
        placeholder={'0.00'}
        inputAmount={amount > 0 ? amount.toString() : ''}
        onInputChange={handleChange}
        asset={asset}
        label={'Withdrawable'}
        max={totalWithdrawAvailable}
        balance={totalWithdrawAvailable}
        setAssetSelected={setAssetSelected}
        assets={assetDeposits}
        maxDecimals={asset.token.decimals}
      />
      <CalculatorPosition asset={asset} amount={Number(amount)} mode={ManageAssetMode.Withdraw} />
      {/*<div className={'w-full border-b border-dashed border-[#E8EBF6] my-3'}></div>*/}
      {/*<div className={'space-y-2'}>*/}
      {/*  <div className={'flex justify-between text-[#737b94]'}>*/}
      {/*    <div>Wallet</div>*/}
      {/*    <div>*/}
      {/*      {formatNumberBalance(balance, 4)} {asset?.token.symbol}*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*  <div className={'flex justify-between text-[#737b94]'}>*/}
      {/*    <div>Withdraw Fee</div>*/}
      {/*    <div>0 {asset?.token.symbol}</div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      {error && <p className={'text-red-500 mt-3 text-center'}>{error}</p>}
      <Button
        loading={loading}
        disabled={loading}
        onClick={handleWithdraw}
        className={'w-full mt-8 bg-[#7F56D9] border-0 text-[#fff] font-semibold h-11 rounded-full'}
      >
        Withdraw
      </Button>
    </div>
  );
};
