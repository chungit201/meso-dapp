import { TetherIcon } from '@/common/components/Icons';
import { InputCustom } from '@/common/components/InputCustom';
import { REDEEM_USDT_ADDRESS } from '@/common/consts';
import useBalanceToken from '@/common/hooks/useBalanceToken';
import useContract from '@/common/hooks/useContract';
import useToken from '@/common/hooks/useTokens';
import appActions from '@/modules/app/actions';
import { formatNumberBalance } from '@/utils';
import { InputEntryFunctionData, InputViewFunctionData } from '@aptos-labs/ts-sdk';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Dropdown, Menu, notification } from 'antd';
import BigNumber from 'bignumber.js';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

const Page: React.FunctionComponent = () => {
  const [amount, setAmount] = React.useState(0);
  const { account, connected } = useWallet();
  const { getTokenBySymbol, tokens } = useToken();
  const { getBalanceCoin } = useBalanceToken();
  const [tokenSelected, setTokenSelected] = useState<Token>();

  const { view, run } = useContract();
  const dispatch = useDispatch();
  const [loading, setLoading] = React.useState(false);

  const tokensRedeem = useMemo(() => {
    const zUSDT = getTokenBySymbol('zUSDT');
    const zUSDc = getTokenBySymbol('zUSDC');
    return [zUSDc, zUSDT];
  }, [tokens]);

  useEffect(() => {
    if (!tokenSelected && tokensRedeem.length > 0) {
      setTokenSelected(tokensRedeem[0]);
    }
  }, [tokensRedeem]);

  const { data: zUsdtBalance = 0, refetch: refetchBalance } = useQuery({
    queryKey: ['zUSDTBalance', account, tokenSelected],
    queryFn: async () => {
      const balance = await getBalanceCoin(tokenSelected as any, account?.address as any);
      return BigNumber(Number(balance))
        .div(BigNumber(10).pow(tokenSelected?.decimals ?? 8))
        .toNumber();
    },
    enabled: !!account?.address && !!tokenSelected,
  });

  const { data: totalAvailable = 0, refetch } = useQuery({
    queryKey: ['UsdtAvailable', tokens, tokenSelected],
    queryFn: async () => {
      const payload: InputViewFunctionData = {
        function: `${REDEEM_USDT_ADDRESS}::redemption::native_balance`,
        typeArguments: [tokenSelected?.address as string],
        functionArguments: [],
      };
      const amount = Number((await view(payload))[0]);
      return BigNumber(amount)
        .div(BigNumber(10).pow(tokenSelected?.decimals ?? 8))
        .toNumber();
    },
    enabled: !!tokenSelected,
  });

  const handleMax = () => {
    if (zUsdtBalance > totalAvailable) {
      setAmount(totalAvailable);
    } else {
      setAmount(zUsdtBalance);
    }
  };

  const redeem = async () => {
    if (!connected) {
      dispatch(appActions.SET_SHOW_CONNECT(true));
      return;
    }
    if (zUsdtBalance < amount) {
      notification.error({ message: `Insufficient balance of ${tokenSelected?.symbol}!` });
      return;
    }

    if (amount > totalAvailable) {
      notification.error({ message: 'Exceeded limit amount!' });
      return;
    }

    setLoading(true);
    try {
      const payload: InputEntryFunctionData = {
        function: `${REDEEM_USDT_ADDRESS}::redemption::redeem`,
        typeArguments: [tokenSelected?.address as string],
        functionArguments: [
          BigNumber(amount)
            .times(BigNumber(10).pow(tokenSelected?.decimals ?? 8))
            .toString(),
        ],
      };
      const { hash } = await run(payload);
      if (hash) {
        await refetchBalance();
        await refetch();
        notification.success({ message: 'Converted successfully' });
      }
    } catch (e: any) {
      console.log(e);
      notification.error({ message: JSON.stringify(e.message) });
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-[1536px] mx-auto pb-20 pt-10 px-3">
      <div className="text-center flex flex-col gap-6 mt-5 sm:mt-20">
        <h1 className="text-3xl font-semibold">
          {tokenSelected?.symbol} to {tokenSelected?.symbol === 'zUSDT' ? 'USDt' : 'USDC'}
        </h1>
        <div className="text-[#475467] mx-auto max-w-[300px]">
          Effortlessly convert to native {tokenSelected?.symbol === 'zUSDT' ? 'USDt (Tether)' : 'USDC'} at Meso Finance
          - Zero Fees!
        </div>
        <div className="flex justify-center">
          <div className="bg-[#FFF] border font-semibold border-[#F2F4F7] text-[#50AF95] rounded-full py-1 px-4">
            Conversion Rate: 1 {tokenSelected?.symbol} = 1 {tokenSelected?.symbol === 'zUSDT' ? 'USDt' : 'USDC'}
          </div>
        </div>
      </div>

      <Card bordered={false} className="rounded-[36px] bg-[#FFF] p-4 mt-10 w-full sm:w-[480px] mx-auto">
        <div className=" bg-[#F2F4F7] rounded-[24px]">
          <div className="flex bg-[#fff] border rounded-[24px] border-[#DCDFEA] p-5 flex-col gap-3">
            <div>Convert</div>
            <div className="flex">
              <InputCustom
                max={100000000}
                maxDecimals={6}
                onInputChange={(val) => setAmount(val)}
                inputAmount={amount ? amount.toString() : ''}
                className="text-xl"
              />
              <Dropdown
                overlay={
                  <Menu>
                    {tokensRedeem.map((token) => (
                      <Menu.Item key={token?.address} onClick={() => setTokenSelected(token)}>
                        <div className={'flex items-center gap-2'}>
                          <img
                            alt={''}
                            className={'w-[22px] h-[22px]'}
                            src={`https://image.meso.finance/${token?.symbol.toLowerCase()}.png`}
                          ></img>
                          <span className={'text-[#000] font-medium'}>{token?.symbol}</span>
                        </div>
                      </Menu.Item>
                    ))}
                  </Menu>
                }
              >
                <div className="border cursor-pointer flex items-center min-w-[108px] justify-center gap-1 border-[#E4E7EC] py-[5px] px-2 rounded-full">
                  <img
                    alt={''}
                    className={'w-[25px] h-[25px]'}
                    src={`https://image.meso.finance/${tokenSelected?.symbol.toLowerCase()}.png`}
                  ></img>
                  <span className="font-medium">{tokenSelected?.symbol}</span>
                  {tokensRedeem.length > 1 && <i className="fa-solid fa-chevron-down"></i>}
                </div>
              </Dropdown>
            </div>
            <div className="text-[#98A2B3] flex justify-between">
              <div>~${formatNumberBalance(amount)}</div>
              <div onClick={handleMax} className="flex cursor-pointer items-center gap-2">
                <div>
                  {formatNumberBalance(zUsdtBalance, 4)} {tokenSelected?.symbol}
                </div>
              </div>
            </div>
          </div>
          <div className={'flex justify-between p-4'}>
            <div className={'flex text-[#475467] font-medium items-center gap-2'}>
              Receive:
              <div className={'flex items-center gap-1'}>
                {tokenSelected?.symbol === 'zUSDT' ? (
                  <TetherIcon />
                ) : (
                  <img alt={''} className={'w-[22px] h-[22px]'} src={`https://image.meso.finance/usdc.png`}></img>
                )}
                {formatNumberBalance(amount)} {tokenSelected?.symbol === 'zUSDT' ? 'USDt' : 'USDC'}
              </div>
            </div>
            <div className={'text-[#667085]'}>
              Available: {formatNumberBalance(totalAvailable)} {tokenSelected?.symbol === 'zUSDT' ? 'USDt' : 'USDC'}
            </div>
          </div>
        </div>

        <Button
          loading={loading}
          disabled={loading || amount === 0 || !amount}
          onClick={redeem}
          className="mt-6 bg-[#50AF95] text-[#fff] disabled:bg-[#ccc] w-full h-[48px] rounded-full font-semibold border-0"
        >
          Convert Now
        </Button>
      </Card>
    </div>
  );
};

export default Page;
