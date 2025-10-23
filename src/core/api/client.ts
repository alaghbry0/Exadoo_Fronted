/**
 * API Client موحد مع error handling و retry logic
 */
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'

// Types
export interface ApiError {
  message: string
  status?: number
  code?: string
  data?: unknown
}

export interface RetryConfig {
  retries: number
  retryDelay: number
  retryCondition?: (error: AxiosError) => boolean
}

// Logger موحد يعتمد على البيئة
const isDev = process.env.NODE_ENV === 'development'

class Logger {
  static info(message: string, ...args: unknown[]) {
    if (isDev) console.log(`ℹ️ ${message}`, ...args)
  }

  static error(message: string, ...args: unknown[]) {
    if (isDev) console.error(`❌ ${message}`, ...args)
  }

  static warn(message: string, ...args: unknown[]) {
    if (isDev) console.warn(`⚠️ ${message}`, ...args)
  }

  static success(message: string, ...args: unknown[]) {
    if (isDev) console.log(`✅ ${message}`, ...args)
  }
}

// API Client
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    Logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    Logger.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    Logger.success(`API Response: ${response.config.url}`, response.status)
    return response
  },
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retry?: number }

    Logger.error(`API Error: ${config?.url}`, error.response?.status)

    // Retry logic
    if (config && shouldRetry(error) && (!config._retry || config._retry < 3)) {
      config._retry = (config._retry || 0) + 1
      const delay = Math.min(1000 * Math.pow(2, config._retry), 10000)
      
      Logger.warn(`Retrying request (${config._retry}/3) after ${delay}ms...`)
      
      await new Promise((resolve) => setTimeout(resolve, delay))
      return apiClient(config)
    }

    return Promise.reject(formatError(error))
  }
)

// Helper functions
function shouldRetry(error: AxiosError): boolean {
  return (
    !error.response ||
    error.response.status >= 500 ||
    error.response.status === 408 ||
    error.code === 'ECONNABORTED'
  )
}

function formatError(error: AxiosError): ApiError {
  if (error.response) {
    const data = error.response.data as { error?: string; message?: string }
    return {
      message: data?.error || data?.message || 'حدث خطأ في الخادم',
      status: error.response.status,
      data: error.response.data,
    }
  }

  if (error.request) {
    return {
      message: 'لا يمكن الاتصال بالخادم',
      code: error.code,
    }
  }

  return {
    message: error.message || 'حدث خطأ غير متوقع',
  }
}

// Typed API methods
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => res.data),

  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),

  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),

  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),

  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
}

export { Logger, apiClient }
export default api
