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
