"use client";

import Image from "next/image";
import type { Message } from "@/types/Message";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type ImageMessageBubbleProps = {
  message: Message;
  onImageClick: (messageId: number, expiryTimestamp?: number) => void;
};

export default function ImageMessageBubble({ message, onImageClick }: ImageMessageBubbleProps) {
  const isWaiting = Boolean(message.imageUrl && !message.expiryTimestamp);
  const isViewing = Boolean(message.imageUrl && message.countdown && message.expiryTimestamp);
  const isExpired = Boolean(message.imageUrl && message.status === "expired");
  const hasImage = Boolean(message.imageUrl);

  return (
    <div className="relative">
      {isWaiting && hasImage ? (
        <div className="relative">
          <button
            className="button-submit rounded p-2"
            onClick={() => onImageClick(message.id, message.expiryTimestamp)}
          >
            Click to view photo
          </button>
        </div>
      ) : isViewing && message.imageUrl ? (
        <div className="relative overflow-hidden">
          <Image
            id={`image-${message.id}`}
            src={`${API_URL}${message.imageUrl}`}
            alt={message.imageDescription || "Photo"}
            width={300}
            height={240}
            className={`max-h-64 w-auto max-w-xs cursor-pointer rounded object-cover transition-all duration-300 ${
              message.expiryTimestamp && message.expiryTimestamp < Date.now() ? "blur-xl" : ""
            }`}
            unoptimized
          />
          <div
            id={`countdown-${message.id}`}
            className={`bg-opacity-70 absolute top-2 right-2 rounded-full bg-black px-2 py-1 text-xs text-white ${
              message.imgViewed ? "" : "hidden"
            }`}
          >
            {message.expiryTimestamp && message.expiryTimestamp < Date.now() ? "Expired" : `${message.countdown ?? 0}s`}
          </div>
        </div>
      ) : isExpired ? (
        <p className="text-gray-500 italic">Photo expired</p>
      ) : (
        <p className="text-gray-500 italic">Photo unavailable</p>
      )}
    </div>
  );
}
