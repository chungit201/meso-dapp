import instance from '@/common/services/instance'

export const poolService = {
  getIsolatePools: async (): Promise<any> => {
    const url = `/api/v1/pool/isolated`
    return instance.get(url)
  },
  getUserPositions: async (address: string): Promise<any> => {
    const url = `/api/v1/user-assets/isolated-position/${address}`
    return instance.get(url)
  },
}
