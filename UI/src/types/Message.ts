import type { ApiMessage } from "./api";

export type MessageType = "text" | "image";

export interface Message {
  id: number;
  friendId: number;
  content: string;
  isFromMe: boolean;
  timestamp: string;
  type: MessageType;
  isRead: boolean; // For text messages
  status?: "sent" | "delivered" | "read" | "expired";
  imageUrl?: string; // Only for images
  imageDescription?: string; // Description for the image
  imgViewed?: boolean; // For ephemeral images
  expiryTimestamp?: number; // Timestamp when the image should expire
  countdown?: number; // Countdown message for the image
}

// Mapper function to convert API message to frontend Message
export function apiMessageToMessage(
  apiMessage: ApiMessage,
  currentUserId: number,
): Message {
  // Determine if message is from current user
  const isFromMe = apiMessage.sender_id === currentUserId;

  // friendId is the other person in the conversation
  const friendId = isFromMe ? apiMessage.recipient_id : apiMessage.sender_id;

  // Convert expiry_timestamp from ISO string to milliseconds timestamp
  let expiryTimestamp: number | undefined;
  if (apiMessage.expiry_timestamp) {
    expiryTimestamp = new Date(apiMessage.expiry_timestamp).getTime();
  }

  return {
    id: apiMessage.id,
    friendId,
    content: apiMessage.content,
    isFromMe,
    timestamp: apiMessage.created_at,
    type: apiMessage.type,
    isRead: apiMessage.is_read,
    status: apiMessage.status,
    imageUrl: apiMessage.image?.url,
    imageDescription: apiMessage.content, // Content is used as description for images
    imgViewed: apiMessage.img_viewed,
    expiryTimestamp,
    countdown: undefined, // Computed on frontend based on expiryTimestamp
  };
}
