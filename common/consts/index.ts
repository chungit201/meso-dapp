import { MAINNET_INDEXER_URL, MAINNET_NODE_URL, TESTNET_INDEXER_URL, TESTNET_NODE_URL } from '@/configs/aptosConstants'
import { Network } from '@aptos-labs/ts-sdk'
import { NttRoute } from '@wormhole-foundation/sdk-route-ntt'

export const enum envNane {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  DEVELOP = 'develop',
  STG = 'staging',
}

// export const ENV: envNane = process.env.CURRENT_NETWORK as any
export const ENV: envNane = 'staging' as any

export const PRECISION_8 = 100000000
export const MAX_BPS = 10000

const MESO_ADDRESS_TESTNET = '0x86aed6bfe5e9b80bbd9db80f9b8f1af4f1c00f6cb84fdc645444b6b49c3ace88'
const MESO_ADDRESS_STG = '0xeb6c2b3c8dc436bf2bfc901c4626a1ac77030327eac215f76b43bf28a2674417'
const MESO_ADDRESS_MAINNET = '0x68476f9d437e3f32fd262ba898b5e3ee0a23a1d586a6cf29a28add35f253f6f7'
const MESO_ADDRESS_DEVELOP = '0x50f6b36857f315e0e561c322fbea45e74bc02e2adf1250de28972d3309be532d'

const POXY_ADDRESS_TESTNET = '0x67446c6498f5945663b6f0db7a5236a39bb13ca032d235f214bb22203cd50a98'
const POXY_ADDRESS_STG = '0x354d8dcf93153e36a9cde18c653b43f6189b79afa3de99dc5126f1d65616170d'
const POXY_ADDRESS_MAINNET = '0x354d8dcf93153e36a9cde18c653b43f6189b79afa3de99dc5126f1d65616170d'
const POXY_ADDRESS_DEVELOP = '0x67446c6498f5945663b6f0db7a5236a39bb13ca032d235f214bb22203cd50a98'

const LOPPING_ADDRESS_TESTNET = '0x7abc5adad7c920689d7221dc77a08e703574d61a840c5478e33b83cee7226f1a'
const LOPPING_ADDRESS_STG = '0x787f0ccde7b8305be2d8b79cba5c064dd24b3a7408fb55b629a802f9b7b2a2e9'
const LOPPING_ADDRESS_MAINNET = '0x7abc5adad7c920689d7221dc77a08e703574d61a840c5478e33b83cee7226f1a'
const LOPPING_ADDRESS_DEVELOP = '0x7abc5adad7c920689d7221dc77a08e703574d61a840c5478e33b83cee7226f1a'

const REDEEM_USDT_ADDRESS_TESTNET = '0xaaf9be5f08fac41303ea786cd3baf694337f07b91d92ec3fc4a1bcf058d35f0d'
const REDEEM_USDT_ADDRESS_MAINNET = '0xd47ead75b923422f7967257259e7a298f029da9e5484dc7aa1a9efbd4c3ae648'

const ISOLATE_ADDRESS_TESTNET = '0x1d53b8f0459725a6b0b1c07073298de246d56542da752af8967750d078c8bfaa'
const ISOLATE_ADDRESS_MAINNET = '0x72517fcf089ada91726d9be23c4487f7d848b94a2ea6609a8865777920f30ee6'

export const ISOLATE_ADDRESS = [envNane.TESTNET, envNane.DEVELOP].includes(ENV)
  ? ISOLATE_ADDRESS_TESTNET
  : ISOLATE_ADDRESS_MAINNET

export const REDEEM_USDT_ADDRESS = ENV === envNane.MAINNET ? REDEEM_USDT_ADDRESS_MAINNET : REDEEM_USDT_ADDRESS_TESTNET

export const MAX_u64 = '18446744073709551615'
export const FAUCET_CONTRACT_TESTNET = '0x941a5d1335a4505c244b19aeec95f3e462fff71b7807c889099bd537aa662f03'

export const POXY_ADDRESS =
  ENV === envNane.TESTNET
    ? POXY_ADDRESS_TESTNET
    : ENV === envNane.DEVELOP
      ? POXY_ADDRESS_DEVELOP
      : ENV === envNane.STG
        ? POXY_ADDRESS_STG
        : POXY_ADDRESS_MAINNET

export const LOOPING_ADDRESS =
  ENV === envNane.TESTNET
    ? LOPPING_ADDRESS_TESTNET
    : ENV === envNane.DEVELOP
      ? LOPPING_ADDRESS_DEVELOP
      : ENV === envNane.STG
        ? LOPPING_ADDRESS_STG
        : LOPPING_ADDRESS_MAINNET

export const MESO_ADDRESS =
  ENV === envNane.TESTNET
    ? MESO_ADDRESS_TESTNET
    : ENV === envNane.DEVELOP
      ? MESO_ADDRESS_DEVELOP
      : ENV === envNane.STG
        ? MESO_ADDRESS_STG
        : MESO_ADDRESS_MAINNET

export const FULL_NODE_URL = [envNane.DEVELOP, envNane.TESTNET].includes(ENV) ? TESTNET_NODE_URL : MAINNET_NODE_URL
export const INDEXER_URL = [envNane.DEVELOP, envNane.TESTNET].includes(ENV) ? TESTNET_INDEXER_URL : MAINNET_INDEXER_URL

const mainnetConfig = {
  API_ENDPOINT_URL: 'https://api.meso.finance',
  APTOS_SCAN_URL: 'https://aptscan.ai',
  NETWORK: Network.MAINNET,
  MSAFE: 'https://app.m-safe.io/aptos/v2',
}

// Production - testnet branch - aptos testnet
const testnetConfig = {
  API_ENDPOINT_URL: 'https://api-testnet.meso.finance',
  APTOS_SCAN_URL: 'https://aptscan.ai',
  NETWORK: Network.TESTNET,
  MSAFE: 'https://testnet.m-safe.io/aptos/v2',
}

// Production - testnet branch - aptos testnet
const developConfig = {
  API_ENDPOINT_URL: 'https://api-dev.meso.finance',
  APTOS_SCAN_URL: 'https://aptscan.ai',
  NETWORK: Network.TESTNET,
  MSAFE: 'https://testnet.m-safe.io/aptos/v2',
}

// Staging(internal) - stg branch - aptos testnet

const stagingConfig = {
  API_ENDPOINT_URL: 'https://api-stg.meso.finance',
  APTOS_SCAN_URL: 'https://aptscan.ai',
  NETWORK: Network.MAINNET,
  MSAFE: 'https://app.m-safe.io/aptos/v2',
}

export const config =
  ENV === envNane.MAINNET
    ? mainnetConfig
    : ENV === envNane.TESTNET
      ? testnetConfig
      : ENV === envNane.DEVELOP
        ? developConfig
        : ENV === envNane.STG
          ? stagingConfig
          : mainnetConfig

export const NTT_CONFIG_MAINNET: NttRoute.Config = {
  tokens: {
    USDT_NTT: [
      {
        chain: 'Bsc',
        manager: '0x55d398326f99059fF775485246999027B3197955',
        token: '0x55d398326f99059fF775485246999027B3197955',
        transceiver: [
          {
            address: '0x55f7820357FA17A1ECb48E959D5E637bFF956d6F',
            type: 'wormhole',
          },
        ],
      },
      {
        chain: 'Ethereum',
        manager: '0xeBdCe9a913d9400EE75ef31Ce8bd34462D01a1c1',
        token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        transceiver: [
          {
            address: '0x55f7820357FA17A1ECb48E959D5E637bFF956d6F',
            type: 'wormhole',
          },
        ],
      },
      //zUSDT
      {
        chain: 'Aptos',
        manager: '0xeBdCe9a913d9400EE75ef31Ce8bd34462D01a1c1',
        token: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
        transceiver: [
          {
            address: '0x55f7820357FA17A1ECb48E959D5E637bFF956d6F',
            type: 'wormhole',
          },
        ],
      },
      //USDt
      {
        chain: 'Aptos',
        manager: '0xeBdCe9a913d9400EE75ef31Ce8bd34462D01a1c1',
        token: '0x357b0b74bc833e95a115ad22604854d6b0fca151cecd94111770e5d6ffc9dc2b',
        transceiver: [
          {
            address: '0x55f7820357FA17A1ECb48E959D5E637bFF956d6F',
            type: 'wormhole',
          },
        ],
      },
    ],

    USDC_NTT: [
      {
        chain: 'Bsc',
        manager: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        token: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
        transceiver: [
          {
            address: '0x55f7820357FA17A1ECb48E959D5E637bFF956d6F',
            type: 'wormhole',
          },
        ],
      },
      {
        chain: 'Ethereum',
        manager: '0xeBdCe9a913d9400EE75ef31Ce8bd34462D01a1c1',
        token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        transceiver: [
          {
            address: '0x55f7820357FA17A1ECb48E959D5E637bFF956d6F',
            type: 'wormhole',
          },
        ],
      },
      {
        chain: 'Aptos',
        manager: '0xeBdCe9a913d9400EE75ef31Ce8bd34462D01a1c1',
        token: '0xbae207659db88bea0cbead6da0ed00aac12edcdda169e591cd41c94180b46f3b',
        transceiver: [
          {
            address: '0x55f7820357FA17A1ECb48E959D5E637bFF956d6F',
            type: 'wormhole',
          },
        ],
      },
    ],
    ETH_NTT: [],
  },
}
