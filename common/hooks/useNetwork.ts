import { networkConfig } from '@/utils/network';

let aptosRPC = '';

const useNetworkConfiguration = () => {
  const network = networkConfig();
  if (!aptosRPC) aptosRPC = network;
  return { networkCfg: network };
};

export default useNetworkConfiguration;
