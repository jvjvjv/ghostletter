"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import type { Message } from "@/types/Message";
import { Button, Text } from "@mantine/core";
import ImageViewer from "./ImageViewer";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

type ImageMessageBubbleProps = {
  message: Message;
  onImageClick: (messageId: number, expiryTimestamp?: number) => void;
};

export default function ImageMessageBubble({ message, onImageClick }: ImageMessageBubbleProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const isWaiting = Boolean(message.imageUrl && !message.expiryTimestamp);
  const isViewing = Boolean(message.imageUrl && message.countdown && message.expiryTimestamp);
  const isExpired = Boolean(message.imageUrl && message.status === "expired");
  const hasImage = Boolean(message.imageUrl);

  const handleViewClick = () => {
    onImageClick(message.id, message.expiryTimestamp);
    setIsViewerOpen(true);
  };

  const handleViewerClose = () => {
    setIsViewerOpen(false);
  };

  return (
    <>
      {isWaiting && hasImage ? (
        <Button onClick={handleViewClick}>View</Button>
      ) : isViewing && message.imageUrl ? (
        <Text c="dimmed" size="sm" fs="italic">
          Photo viewed
        </Text>
      ) : isExpired ? (
        <Text c="dimmed" size="sm" fs="italic">
          Photo expired
        </Text>
      ) : (
        <Text c="dimmed" size="sm" fs="italic">
          Photo unavailable
        </Text>
      )}

      {/* Fullscreen image viewer */}
      {isViewerOpen &&
        message.imageUrl &&
        message.countdown !== undefined &&
        message.countdown > 0 &&
        createPortal(
          <ImageViewer
            imageUrl={`${API_URL}${message.imageUrl}`}
            countdown={message.countdown}
            onExpired={handleViewerClose}
          />,
          document.body
        )}
    </>
  );
}
