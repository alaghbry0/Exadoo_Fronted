/**
 * Fetch Client - بديل خفيف لـ axios (~5KB بدلاً من 30KB)
 * يوفر نفس الـ API interface مع retry logic و error handling
 */

import logger from "@/infrastructure/logging/logger";

// Types
export interface FetchError {
  message: string;
  status?: number;
  code?: string;
  data?: unknown;
}

export interface FetchConfig extends RequestInit {
  timeout?: number;
  retry?: number;
  retryDelay?: number;
  retryCondition?: (error: FetchError) => boolean;
}

// Default configuration
const DEFAULT_CONFIG: FetchConfig = {
  timeout: 30000,
  retry: 2,
  retryDelay: 1000,
  headers: {
    "Content-Type": "application/json",
  },
};

// Helper: Create timeout promise
function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Request timeout")), ms);
  });
}

// Helper: Sleep function
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Helper: Should retry
function shouldRetry(
  error: FetchError,
  attempt: number,
  maxRetries: number,
): boolean {
  if (attempt >= maxRetries) return false;

  // Retry on network errors or 5xx errors
  return (
    !error.status ||
    error.status >= 500 ||
    error.status === 408 ||
    error.code === "ECONNABORTED"
  );
}

// Helper: Format error
function formatError(error: unknown): FetchError {
  if (error instanceof Response) {
    return {
      message: error.statusText || "حدث خطأ في الخادم",
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message || "حدث خطأ غير متوقع",
      code: (error as any).code,
    };
  }

  return {
    message: "حدث خطأ غير متوقع",
  };
}

// Main fetch function with retry logic
async function fetchWithRetry<T = unknown>(
  url: string,
  config: FetchConfig = {},
): Promise<T> {
  const {
    timeout = DEFAULT_CONFIG.timeout,
    retry = DEFAULT_CONFIG.retry,
    retryDelay = DEFAULT_CONFIG.retryDelay,
    ...fetchConfig
  } = { ...DEFAULT_CONFIG, ...config };

  let lastError: FetchError | null = null;
  let attempt = 0;

  while (attempt <= retry!) {
    try {
      logger.info(
        `API Request: ${fetchConfig.method || "GET"} ${url}${attempt > 0 ? ` (retry ${attempt})` : ""}`,
      );

      // Create fetch promise with timeout
      const fetchPromise = fetch(url, fetchConfig);
      const timeoutPromise = createTimeoutPromise(timeout!);

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      // Check if response is ok
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          message: errorData.error || errorData.message || response.statusText,
          status: response.status,
          data: errorData,
        };
      }

      // Parse response
      const contentType = response.headers.get("content-type");
      let data: T;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else if (contentType?.includes("text/")) {
        data = (await response.text()) as T;
      } else {
        data = (await response.blob()) as T;
      }

      logger.success(`API Response: ${url}`, response.status);
      return data;
    } catch (error) {
      lastError = formatError(error);

      // Check if should retry
      if (shouldRetry(lastError, attempt, retry!)) {
        attempt++;
        const delay = Math.min(retryDelay! * Math.pow(2, attempt - 1), 10000);
        logger.warn(
          `Retrying request (${attempt}/${retry}) after ${delay}ms...`,
        );
        await sleep(delay);
        continue;
      }

      // No more retries
      logger.error(`API Error: ${url}`, lastError);
      throw lastError;
    }
  }

  throw lastError;
}

// API Client with typed methods
export const fetchClient = {
  get: <T = unknown>(url: string, config?: FetchConfig) =>
    fetchWithRetry<T>(url, { ...config, method: "GET" }),

  post: <T = unknown>(url: string, data?: unknown, config?: FetchConfig) =>
    fetchWithRetry<T>(url, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = unknown>(url: string, data?: unknown, config?: FetchConfig) =>
    fetchWithRetry<T>(url, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = unknown>(url: string, data?: unknown, config?: FetchConfig) =>
    fetchWithRetry<T>(url, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = unknown>(url: string, config?: FetchConfig) =>
    fetchWithRetry<T>(url, { ...config, method: "DELETE" }),
};

// Create API instance with base URL
export function createFetchClient(baseURL: string) {
  return {
    get: <T = unknown>(url: string, config?: FetchConfig) =>
      fetchClient.get<T>(`${baseURL}${url}`, config),

    post: <T = unknown>(url: string, data?: unknown, config?: FetchConfig) =>
      fetchClient.post<T>(`${baseURL}${url}`, data, config),

    put: <T = unknown>(url: string, data?: unknown, config?: FetchConfig) =>
      fetchClient.put<T>(`${baseURL}${url}`, data, config),

    patch: <T = unknown>(url: string, data?: unknown, config?: FetchConfig) =>
      fetchClient.patch<T>(`${baseURL}${url}`, data, config),

    delete: <T = unknown>(url: string, config?: FetchConfig) =>
      fetchClient.delete<T>(`${baseURL}${url}`, config),
  };
}

// Default API instance
export const api = createFetchClient(process.env.NEXT_PUBLIC_BACKEND_URL || "");

export default api;
