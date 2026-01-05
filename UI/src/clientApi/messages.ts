import type { ApiMessage } from "@/types/api";
import type { Message, MessageType } from "@/types/Message";

import { apiClient } from "./client";
import { apiMessageToMessage } from "@/types/Message";

/**
 * Get conversation messages with a specific friend
 * @param friendId - The friend's user ID
 * @param page - Optional page number for pagination
 * @param currentUserId - Current user's ID for mapping isFromMe
 */
export async function getConversation(
  friendId: number,
  currentUserId: number,
  page?: number,
): Promise<Message[]> {
  const url = page
    ? `/conversations/${friendId}?page=${page}`
    : `/conversations/${friendId}`;

  const apiMessages = await apiClient.get<ApiMessage[]>(url);

  return apiMessages.map((apiMessage) =>
    apiMessageToMessage(apiMessage, currentUserId),
  );
}

/**
 * Send a new message
 * @param recipientId - The recipient's user ID
 * @param content - Message content
 * @param type - Message type ('text' or 'image')
 * @param imageId - Optional image ID for image messages
 * @param currentUserId - Current user's ID for mapping response
 */
export async function sendMessage(
  recipientId: number,
  content: string,
  type: MessageType,
  currentUserId: number,
  imageId?: number,
): Promise<Message> {
  const apiMessage = await apiClient.post<ApiMessage>("/messages", {
    recipient_id: recipientId,
    content,
    type,
    image_id: imageId,
  });

  return apiMessageToMessage(apiMessage, currentUserId);
}

/**
 * Mark a text message as read
 * @param messageId - The message ID
 * @param currentUserId - Current user's ID for mapping response
 */
export async function markMessageAsRead(
  messageId: number,
  currentUserId: number,
): Promise<Message> {
  const apiMessage = await apiClient.post<ApiMessage>(
    `/messages/${messageId}/mark-read`,
  );

  return apiMessageToMessage(apiMessage, currentUserId);
}

/**
 * Mark an image message as viewed (sets expiry timer)
 * @param messageId - The message ID
 * @param currentUserId - Current user's ID for mapping response
 */
export async function markMessageAsViewed(
  messageId: number,
  currentUserId: number,
): Promise<Message> {
  const apiMessage = await apiClient.post<ApiMessage>(
    `/messages/${messageId}/mark-viewed`,
  );

  return apiMessageToMessage(apiMessage, currentUserId);
}

/**
 * Delete a message
 * @param messageId - The message ID to delete
 */
export async function deleteMessage(messageId: number): Promise<void> {
  return apiClient.delete<void>(`/messages/${messageId}`);
}

/**
 * Get all messages (sent and received)
 * @param currentUserId - Current user's ID for mapping
 * @param page - Optional page number for pagination
 */
export async function getAllMessages(
  currentUserId: number,
  page?: number,
): Promise<Message[]> {
  const url = page ? `/messages?page=${page}` : "/messages";

  const apiMessages = await apiClient.get<ApiMessage[]>(url);

  return apiMessages.map((apiMessage) =>
    apiMessageToMessage(apiMessage, currentUserId),
  );
}
