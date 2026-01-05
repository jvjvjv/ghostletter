export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_PREFIX = "/api";

export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // If path already includes /api, don't add prefix
  if (cleanPath.startsWith(API_PREFIX)) {
    return `${API_BASE_URL}${cleanPath}`;
  }

  return `${API_BASE_URL}${API_PREFIX}${cleanPath}`;
}

export function getAuthUrl(path: string): string {
  // Auth endpoints (login, register, etc.) don't use /api prefix
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
