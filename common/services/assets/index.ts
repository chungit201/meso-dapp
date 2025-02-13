import instance from '@/common/services/instance'
import nextInstance from '@/common/services/nextInstance'

export const getPools = async (page: number): Promise<any> => {
  const url = `/api/v1/pool?page=${page}&limit=1000`
  return instance.get(url)
}

export const getPoolsBackup = async (): Promise<{ data: PoolAsset[] }> => {
  const url = `/api/pool/backup`
  return nextInstance.get(url)
}

export const getTokens = async (): Promise<{ data: Token[] }> => {
  const url = `/api/v1/token`
  return instance.get(url)
}

export const backup = async (): Promise<any> => {
  const url = `/api/backup`
  return nextInstance.post(url)
}

export const getResourceAccount = async () => {
  const url = '/api/v1/resources'
  return instance.get(url)
}

export const getMarketDashboard = async (data: { type: string }) => {
  const url = `/api/v1/market-info/dashboard`
  return instance.post(url, data)
}
