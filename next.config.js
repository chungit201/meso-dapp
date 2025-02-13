/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    CURRENT_NETWORK: process.env.CURRENT_NETWORK,
    RPC_DEV: process.env.RPC_DEV,
    RPC_STG: process.env.RPC_STG,
    RPC_PROD: process.env.RPC_PROD,
    API_KEY: process.env.API_KEY,
  },
};
module.exports = nextConfig;
