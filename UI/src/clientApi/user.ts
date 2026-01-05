import type { ApiUser } from "@/types/api";
import type { User } from "@/types/User";

import { apiClient } from "./client";
import { apiUserToUser } from "@/types/User";

/**
 * Get current authenticated user profile
 */
export async function getUserProfile(): Promise<User> {
  const apiUser = await apiClient.get<ApiUser>("/user");
  return apiUserToUser(apiUser);
}

/**
 * Get authenticated user (alias for getUserProfile)
 */
export async function getCurrentUser(): Promise<User> {
  return getUserProfile();
}
