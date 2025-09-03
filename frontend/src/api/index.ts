import axios from "axios"

const Local_Base_URL = "http://localhost:3001"
export const BASE_URL: string = // Local_Base_URL
  import.meta.env.VITE_APP_BASE_URL || "https://staging.robo-apply.com"

const api = axios.create({
  // @ts-ignore
  baseURL: BASE_URL
})
// request interceptora
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error?.response && error?.response?.status === 401) {
      localStorage.clear()
      window.location.href = "/"
    }
    return Promise.reject(error)
  }
)

export default api
