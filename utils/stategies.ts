import { ENV, envNane, LOOPING_ADDRESS, MAX_BPS } from '@/common/consts';
import { LoopMode } from '@/common/hooks/strategies/ModalLoop';
import { CoinType } from '@/common/hooks/useBalanceToken';
import { InputEntryFunctionData, InputViewFunctionData } from '@aptos-labs/ts-sdk';
import BigNumber from 'bignumber.js';

export enum StrategyStatus {
  Active = 'Active',
  ComingSoon = 'Coming Soon',
}

export enum StrategyType {
  LSD = 'LSD',
  STABLE = 'Stable',
}

export type Strategy = {
  asset0: PoolAsset;
  asset1: PoolAsset;
  type: StrategyType;
  maxApr: number;
  totalAvailable: number;
  netApr: number | null;
  riskFactor: number | null;
  totalSupplied: number;
  totalBorrowed: number;
  status: StrategyStatus;
  amountDeposited: number;
  totalDebt: number;
  userLeverage: number;
};

const strategiesPairsMainnet = [
  {
    tokenA: 'stAPT',
    tokenB: 'APT',
    status: StrategyStatus.Active,
  },
  {
    tokenA: 'stAPT',
    tokenB: 'amAPT',
    status: StrategyStatus.Active,
  },
  {
    tokenA: 'zUSDT',
    tokenB: 'zUSDT',
    status: StrategyStatus.Active,
  },
  {
    tokenA: 'zUSDC',
    tokenB: 'zUSDC',
    status: StrategyStatus.Active,
  },
  {
    tokenA: 'truAPT',
    tokenB: 'truAPT',
    status: StrategyStatus.Active,
  },
  {
    tokenA: 'USDt',
    tokenB: 'USDt',
    status: StrategyStatus.Active,
  },
];

const strategiesPairsStg = [
  {
    tokenA: 'stAPT',
    tokenB: 'APT',
    status: StrategyStatus.Active,
  },
  {
    tokenA: 'stAPT',
    tokenB: 'amAPT',
    status: StrategyStatus.Active,
  },
  {
    tokenA: 'zUSDT',
    tokenB: 'zUSDT',
    status: StrategyStatus.Active,
  },
  {
    tokenA: 'zUSDC',
    tokenB: 'zUSDC',
    status: StrategyStatus.Active,
  },
  {
    tokenA: 'CELL',
    tokenB: 'CELL',
    status: StrategyStatus.Active,
  },
];

const strategiesPairsTestnet = [
  {
    tokenA: 'stAPT',
    tokenB: 'APT',
    status: StrategyStatus.Active,
  },
  {
    tokenA: 'APT',
    tokenB: 'USDC',
    status: StrategyStatus.Active,
  },
  {
    tokenA: 'USDC',
    tokenB: 'USDC',
    status: StrategyStatus.Active,
  },
  {
    tokenA: 'USDT',
    tokenB: 'USDT',
    status: StrategyStatus.Active,
  },
];

export const strategiesPairs =
  ENV === envNane.DEVELOP ? strategiesPairsTestnet : ENV === envNane.STG ? strategiesPairsStg : strategiesPairsMainnet;

export const calculatePositionLoop = (
  amountLooping: number,
  asset: PoolAsset,
  assetDeposits: PoolAsset[],
  assetDebts: PoolAsset[],
  userEMode: string,
  leverage: number,
  type: LoopMode,
) => {
  let totalSupplyBalance = 0;
  let totalBorrowBalance = 0;
  let totalSupplyAprBalance = 0;
  let totalBorrowAprBalance = 0;
  let borrowingPower = 0;
  let totalBorrowAvailable = 0;

  for (const item of assetDeposits) {
    if (
      (item.poolAddress === asset?.poolAddress && type === LoopMode.INCREASE) ||
      (item.poolAddress === asset?.poolAddress && type === LoopMode.WITHDRAW)
    )
      continue;
    const ltv = item.emodeId === userEMode ? item.emodeBps / MAX_BPS : item.normaBps / MAX_BPS;
    if (item.amountDeposit) {
      totalSupplyBalance += item.amountDeposit * item?.token?.price;
      totalSupplyAprBalance +=
        item.amountDeposit * item?.token.price * ((item.supplyApy + item.stakingApr + item.incentiveSupplyApy) / 100);
      borrowingPower +=
        item.amountDeposit *
        item?.token?.price *
        (userEMode && item.emodeId === userEMode
          ? item.emodeLiquidationThresholdBps / MAX_BPS
          : item.liquidationThresholdBps / MAX_BPS);
      totalBorrowAvailable += item.amountDeposit * item?.token?.price * ltv;
    }
  }
  for (const item of assetDebts) {
    if (
      (item.poolAddress === asset?.poolAddress && type === LoopMode.INCREASE) ||
      (item.poolAddress === asset?.poolAddress && type === LoopMode.WITHDRAW)
    )
      continue;
    if (item.debtAmount) {
      totalBorrowBalance += item.debtAmount * item?.token?.price;
      totalBorrowAprBalance +=
        item.debtAmount * item?.token?.price * ((item.borrowApy - item.incentiveBorrowApy) / 100);
    }
  }

  const LEVERAGE_PRECISION = 100;
  const loopValue = amountLooping * asset?.token?.price * leverage;
  const borrowValue =
    ((amountLooping * (leverage * LEVERAGE_PRECISION - LEVERAGE_PRECISION)) / LEVERAGE_PRECISION) * asset.token.price;

  const borrowingPowerAmountChange =
    loopValue *
    (userEMode && asset.emodeId === userEMode
      ? asset.emodeLiquidationThresholdBps / 10000
      : asset.liquidationThresholdBps / 10000);

  const ltv = asset.emodeId === userEMode ? asset.emodeBps / MAX_BPS : asset.normaBps / MAX_BPS;

  const newNetBalance = totalSupplyBalance - totalBorrowBalance + amountLooping * asset?.token?.price;

  totalSupplyAprBalance =
    totalSupplyAprBalance + loopValue * ((asset.supplyApy + asset.stakingApr + asset.incentiveSupplyApy) / 100);
  totalBorrowAprBalance = totalBorrowAprBalance + borrowValue * ((asset.borrowApy - asset.incentiveBorrowApy) / 100);

  const newNetApr = ((totalSupplyAprBalance - totalBorrowAprBalance) / newNetBalance) * 100;

  const borrowBalance = borrowValue + totalBorrowBalance;
  const borrowingPowerChange = borrowingPowerAmountChange + borrowingPower;

  const newRiskFactor = borrowingPowerChange > 0 ? (borrowBalance / borrowingPowerChange) * 100 : 0;
  const newBorrowingPower = ((totalBorrowBalance + borrowValue) / (totalBorrowAvailable + borrowValue * ltv)) * 100;

  return {
    netBalance: !isNaN(newNetBalance) ? newNetBalance : 0,
    netApr: !isNaN(newNetApr) ? newNetApr : 0,
    riskFactor: !isNaN(newRiskFactor) ? newRiskFactor : 0,
    borrowingPower: !isNaN(newBorrowingPower) ? newBorrowingPower : 0,
  };
};

export const generatePayloadUserPosition = (pair: Strategy, walletAddress: string) => {
  if (pair.asset0.token.symbol === 'stAPT') {
    return {
      function: `${LOOPING_ADDRESS}::ms_loop_stapt::get_users_position`,
      typeArguments: [pair.asset1.token.address],
      functionArguments: [walletAddress],
    } as InputViewFunctionData;
  }
  if (pair.asset0.token.type === CoinType.COIN) {
    return {
      function: `${LOOPING_ADDRESS}::ms_loop_coin::get_users_position`,
      typeArguments: [pair.asset1.token.address],
      functionArguments: [walletAddress],
    } as InputViewFunctionData;
  } else {
    return {
      function: `${LOOPING_ADDRESS}::ms_loop_fa::get_users_position`,
      typeArguments: [],
      functionArguments: [pair.asset1.token.address, walletAddress],
    } as InputViewFunctionData;
  }
};

export const generatePayloadLoop = (pair: Strategy, amountDeposit: number, leverage: number) => {
  if (pair.type === StrategyType.LSD) {
    return {
      function: `${LOOPING_ADDRESS}::ms_loop_stapt::amnis_stake`,
      typeArguments: [pair.asset0.token.address, pair.asset1.token.address],
      functionArguments: [
        BigNumber(amountDeposit).times(BigNumber(10).pow(pair.asset0.token.decimals)).toString(),
        BigNumber(leverage).times(100).toString(),
      ],
    } as InputEntryFunctionData;
  } else {
    if (pair.asset0.token.type === CoinType.COIN) {
      return {
        function: `${LOOPING_ADDRESS}::ms_loop_coin::deposit`,
        typeArguments: [pair.asset0.token.address],
        functionArguments: [
          BigNumber(amountDeposit).times(BigNumber(10).pow(pair.asset0.token.decimals)).toString(),
          BigNumber(leverage).times(100).toString(),
        ],
      } as InputEntryFunctionData;
    } else {
      return {
        function: `${LOOPING_ADDRESS}::ms_loop_fa::deposit`,
        typeArguments: [],
        functionArguments: [
          pair.asset0.token.address,
          BigNumber(amountDeposit).times(BigNumber(10).pow(pair.asset0.token.decimals)).toString(),
          BigNumber(leverage).times(100).toString(),
        ],
      } as InputEntryFunctionData;
    }
  }
};

export const generatePayloadIncrease = (pair: Strategy, leverage: number) => {
  if (pair.type === StrategyType.LSD) {
    return {
      function: `${LOOPING_ADDRESS}::ms_loop_stapt::increase_leverage`,
      typeArguments: [pair.asset0.token.address],
      functionArguments: [BigNumber(leverage).times(100).toString()],
    } as InputEntryFunctionData;
  } else {
    if (pair.asset0.token.type === CoinType.COIN) {
      return {
        function: `${LOOPING_ADDRESS}::ms_loop_coin::increase_leverage`,
        typeArguments: [pair.asset0.token.address],
        functionArguments: [BigNumber(leverage).times(100).toString()],
      } as InputEntryFunctionData;
    } else {
      return {
        function: `${LOOPING_ADDRESS}::ms_loop_fa::increase_leverage`,
        typeArguments: [],
        functionArguments: [pair.asset0.token.address, BigNumber(leverage).times(100).toString()],
      } as InputEntryFunctionData;
    }
  }
};

export const generatePayloadWithdraw = (pair: Strategy) => {
  if (pair.type === StrategyType.STABLE) {
    if (pair.asset0.token.type === CoinType.COIN) {
      return {
        function: `${LOOPING_ADDRESS}::ms_loop_coin::withdraw`,
        typeArguments: [pair.asset0.token.address],
        functionArguments: [],
      } as InputEntryFunctionData;
    } else {
      return {
        function: `${LOOPING_ADDRESS}::ms_loop_fa::withdraw`,
        typeArguments: [],
        functionArguments: [pair.asset0.token.address],
      } as InputEntryFunctionData;
    }
  } else {
    return null;
  }
};
