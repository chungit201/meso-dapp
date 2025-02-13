import { MesoContext } from '@/common/context/index';
import { getTokens } from '@/common/services/assets';
import { useQuery } from '@tanstack/react-query';
import React, { ReactNode } from 'react';

export interface WalletProviderProps {
  children: ReactNode;
}

export const MesoProvider: React.FunctionComponent<WalletProviderProps> = ({ children }) => {
  const { data: tokens = [], isFetching } = useQuery({
    queryKey: ['getAllTokens'],
    queryFn: async () => {
      const { data } = await getTokens();
      return data;
    },
    refetchInterval: 10000,
  });

  return (
    <MesoContext.Provider
      value={{
        tokens,
        isFetchingTokens: isFetching,
      }}
    >
      {children}
    </MesoContext.Provider>
  );
};
