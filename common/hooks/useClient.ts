import { config, ENV, envNane, FULL_NODE_URL, INDEXER_URL } from '@/common/consts';
import { TESTNET_FAUCET_URL, TESTNET_NODE_URL } from '@/configs/aptosConstants';
import { Aptos, AptosConfig, ClientConfig } from '@aptos-labs/ts-sdk';
import {
  AptosAccount,
  AptosClient,
  CoinClient,
  FaucetClient,
  FungibleAssetClient,
  IndexerClient,
  Network,
  Provider,
} from 'aptos';

const useClient = () => {
  const aptosClient = ENV === envNane.TESTNET ? new AptosClient(FULL_NODE_URL) : new AptosClient(INDEXER_URL);

  const provider = new Provider({
    fullnodeUrl: FULL_NODE_URL,
    indexerUrl: INDEXER_URL,
  });
  const coinClient = new CoinClient(provider);
  const fungibleAsset = new FungibleAssetClient(provider);
  const faucetClient = new FaucetClient(TESTNET_NODE_URL, TESTNET_FAUCET_URL);
  const indexerClient = new IndexerClient(INDEXER_URL);

  const clientConfig: ClientConfig = {
    API_KEY: process.env.API_KEY,
  };

  const aptosConfig = new AptosConfig({
    network: config.NETWORK,
    fullnode: FULL_NODE_URL,
    clientConfig: config.NETWORK === Network.MAINNET ? clientConfig : undefined,
  });

  const aptos = new Aptos(aptosConfig);
  const aptosAccount = new AptosAccount();
  return {
    aptosClient,
    provider,
    coinClient,
    fungibleAsset,
    indexerClient,
    aptosAccount,
    aptos,
    faucetClient,
  };
};

export default useClient;
