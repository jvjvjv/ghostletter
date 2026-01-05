"use client";

import { DateTime } from "luxon";
import type { Message } from "@/types/Message";

import ImageMessageBubble from "./ImageMessageBubble";
import TextMessageBubble from "./TextMessageBubble";

type MessageItemProps = {
  message: Message;
  onImageClick: (messageId: number, expiryTimestamp?: number) => void;
};

export default function MessageItem({ message, onImageClick }: MessageItemProps) {
  const alignment = message.isFromMe ? "justify-end" : "justify-start";
  const bubbleStyles = message.isFromMe
    ? "rounded-br-none bg-indigo-500 text-white"
    : "rounded-bl-none border border-gray-200 bg-white";

  return (
    <div className={`flex ${alignment}`}>
      <div className={`max-w-[75%] rounded-lg p-3 ${bubbleStyles}`}>
        {message.type === "text" ? (
          <TextMessageBubble message={message} />
        ) : (
          <ImageMessageBubble message={message} onImageClick={onImageClick} />
        )}
        <div className={message.isFromMe ? "mt-1 text-xs text-indigo-200" : "mt-1 text-xs text-gray-500"}>
          {DateTime.fromISO(message.timestamp).toLocaleString(DateTime.DATETIME_MED)}
        </div>
      </div>
    </div>
  );
}
