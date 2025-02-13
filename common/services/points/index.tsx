import instance from '@/common/services/instance'

export const getNonce = async (address: string) => {
  const url = `/api/v1/user/nonce/${address}`
  return instance.get(url)
}

export const login = async (data: {
  address: string
  message: string
  signature: string
  publicKey: string
  nonce: string
  referralCode: string
}) => {
  const url = `/api/v1/user/sign-in`
  return instance.post(url, data)
}

export const getAllTasks = async (): Promise<{ data: any }> => {
  const url = `/api/v1/task/get-all-task`
  return instance.get(url)
}

export const getTasksStatus = async (address: string): Promise<{ data: any }> => {
  const url = `/api/v1/task/status/${address}`
  return instance.get(url)
}

export const getUserInfo = async (address: string): Promise<{ data: any }> => {
  const url = `/api/v1/user/info/${address}`
  return instance.get(url)
}

export const getTotalParticipants = async () => {
  const url = `/api/v1/user/get-total-participants`
  return instance.get(url)
}

export const linkTwitter = async (twitterId: string, twitterToken: string) => {
  const url = `/api/v1/user/link-twitter`
  return instance.post(url, { twitterId, twitterToken })
}

export const linkDiscord = async (discordId: string, discordToken: string) => {
  const url = `/api/v1/user/link-discord`
  return instance.post(url, { discordId, discordToken })
}

export const veryfyTask = async (taskId: string) => {
  const url = `/api/v1/task/verify`
  return instance.post(url, { taskId })
}

export const getDataLeaderBoard = async (page: number = 0, limit: number = 10) => {
  const url = `/api/v1/user/get-leaderboard?page=${page}&limit=${limit}`
  return instance.get(url)
}

export const getRefInfo = async (address: string, page = 1, limit = 10) => {
  const url = `/api/v1/user/ref-info/${address}?page=${page}&limit=${limit}`
  return instance.get(url)
}

export const addPromotionCode = async (promotionCode: string) => {
  const url = `/api/v1/user/add-promotion-code`
  return instance.post(url, { promotionCode })
}
