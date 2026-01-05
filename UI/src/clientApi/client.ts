import Cookies from "js-cookie";

import { getApiUrl, getAuthUrl } from "@/lib/apiConfig";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
  useAuthUrl?: boolean;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth = false, useAuthUrl = false, ...fetchOptions } = options;

  // Build URL
  const url = useAuthUrl ? getAuthUrl(endpoint) : getApiUrl(endpoint);

  // Build headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...fetchOptions.headers,
  };

  // Add auth token if available and not skipped
  if (!skipAuth) {
    const token = Cookies.get("auth-token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  // Add CSRF token for Laravel Sanctum (cookie-based authentication)
  const csrfToken = Cookies.get("XSRF-TOKEN");
  if (csrfToken) {
    headers["X-XSRF-TOKEN"] = decodeURIComponent(csrfToken);
  }

  // Make request
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include", // Include cookies for CSRF
    });

    // Handle 401 Unauthorized - session expired
    if (response.status === 401) {
      // Clear auth state
      Cookies.remove("auth-token");
      Cookies.remove("auth");

      // Redirect to sign-in if not already there
      if (typeof window !== "undefined" && !window.location.pathname.includes("sign-in")) {
        window.location.href = "/sign-in";
      }

      throw new ApiError(401, "Unauthorized - session expired");
    }

    // Handle other error status codes
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let errorData;

      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      throw new ApiError(response.status, errorMessage, errorData);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error or other fetch error
    throw new ApiError(
      0,
      error instanceof Error ? error.message : "Network error",
      error,
    );
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: "GET" });
  },

  post: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete: <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: "DELETE" });
  },

  // Special method for file uploads (multipart/form-data)
  upload: <T>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions,
  ): Promise<T> => {
    const { headers, ...restOptions } = options || {};

    // Remove Content-Type header - browser will set it with boundary
    const uploadHeaders = { ...headers };
    delete uploadHeaders["Content-Type"];

    return apiRequest<T>(endpoint, {
      ...restOptions,
      method: "POST",
      headers: uploadHeaders,
      body: formData,
    });
  },
};
