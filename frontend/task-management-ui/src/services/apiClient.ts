import axios, {type AxiosError, type InternalAxiosRequestConfig} from "axios"

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem("accessToken")

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

let isRefreshing = false

let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function notifyTokenRefresh(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

function clearAuthentication() {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("accessTokenExpiresAt")
  localStorage.removeItem("refreshTokenExpiresAt")
}

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | InternalAxiosRequestConfig & { _retry?: boolean }

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem("refreshToken")

    if (!refreshToken) {
      clearAuthentication()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newAccessToken) => {
          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`

          resolve(apiClient(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/Auth/refresh`,
        {
          refreshToken,
        },
      )

      const {
        accessToken,
        refreshToken: newRefreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
      } = response.data

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", newRefreshToken)
      localStorage.setItem(
        "accessTokenExpiresAt",
        accessTokenExpiresAt,
      )
      localStorage.setItem(
        "refreshTokenExpiresAt",
        refreshTokenExpiresAt,
      )

      notifyTokenRefresh(accessToken)

      originalRequest.headers.Authorization =
        `Bearer ${accessToken}`

      return apiClient(originalRequest)
    } catch (refreshError) {
      clearAuthentication()

      refreshSubscribers = []

      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default apiClient