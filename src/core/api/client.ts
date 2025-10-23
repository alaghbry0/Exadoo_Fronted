/**
 * API Client موحد مع error handling و retry logic
 * استبدال axios بـ fetch لتقليل Bundle Size (~25KB)
 */

// Re-export من fetchClient الجديد
export {
  fetchClient as apiClient,
  api,
  createFetchClient,
  type FetchError as ApiError,
  type FetchConfig,
} from "./fetchClient";

// Re-export Logger من utils
export { default as Logger } from "@/core/utils/logger";

// Default export
import { api } from "./fetchClient";
export default api;
