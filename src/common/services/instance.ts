import axios from 'axios'

import { config } from '@/common/consts'

const instance = axios.create({
  baseURL: config.API_ENDPOINT_URL,
  timeout: 10000,
})

const TOKEN_PAYLOAD_KEY = 'Authorization'

instance.interceptors.request.use(async (config) => {
  const tokens = localStorage.getItem('accessToken')
  if (tokens) {
    if (config.headers) {
      config.headers[TOKEN_PAYLOAD_KEY] = `Bearer ${tokens}`
    }
  }
  return config
})

export default instance
