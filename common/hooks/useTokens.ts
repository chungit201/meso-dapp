import { MesoContext } from '@/common/context';
import { useContext } from 'react';

const useToken = () => {
  const { tokens, isFetchingTokens } = useContext(MesoContext);

  const getTokenBySymbol = (symbol: string) => {
    return tokens.find((item) => item.symbol === symbol)!;
  };

  const getTokenByAddress = (address: string) => {
    return tokens.find((item) => item.address.toLowerCase() === address.toLowerCase())! ?? null;
  };

  return { getTokenByAddress, getTokenBySymbol, tokens };
};

export default useToken;
