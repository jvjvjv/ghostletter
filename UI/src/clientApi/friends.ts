import type { ApiUser, ApiFriendship } from "@/types/api";
import type { Friend } from "@/types/Friend";

import { apiClient } from "./client";
import { apiUserToFriend } from "@/types/Friend";

/**
 * Get list of all friends (returns User objects of friends)
 */
export async function getFriendsList(): Promise<Friend[]> {
  const apiUsers = await apiClient.get<ApiUser[]>("/friends-list");
  return apiUsers.map((apiUser) => apiUserToFriend(apiUser));
}

/**
 * Get a specific friendship by ID
 */
export async function getFriend(friendshipId: number): Promise<ApiFriendship> {
  return apiClient.get<ApiFriendship>(`/friends/${friendshipId}`);
}

/**
 * Add a new friend
 * @param friendUserId - The user ID of the person to add as friend
 */
export async function addFriend(friendUserId: number): Promise<ApiFriendship> {
  return apiClient.post<ApiFriendship>("/friends", {
    friend_user_id: friendUserId,
  });
}

/**
 * Remove a friend
 * @param friendshipId - The friendship ID to remove
 */
export async function removeFriend(friendshipId: number): Promise<void> {
  return apiClient.delete<void>(`/friends/${friendshipId}`);
}
