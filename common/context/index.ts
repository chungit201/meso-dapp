import { createContext } from 'react';

export enum EMODE_ID {
  APT = 'APT',
  USD = 'USD',
}

export const AssetsContext = createContext<{
  refetchUserEmode: () => void;
  allAssetsData: PoolAsset[] | [];
  refetchAllAssetData: () => void;
  assetsMode: PoolAsset[];
  isLoading: boolean;
  isFetchingDataOnchain: boolean;
  refetchPoolsData: () => void;
}>(null as any);

export const MesoContext = createContext<{
  tokens: Token[];
  isFetchingTokens: boolean;
}>(null as any);
