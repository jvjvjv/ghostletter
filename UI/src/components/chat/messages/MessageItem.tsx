"use client";

import { DateTime } from "luxon";
import { Box, Text } from '@mantine/core';
import type { Message } from "@/types/Message";

import ImageMessageBubble from "./ImageMessageBubble";
import TextMessageBubble from "./TextMessageBubble";

type MessageItemProps = {
  message: Message;
  onImageClick: (messageId: number, expiryTimestamp?: number) => void;
};

export default function MessageItem({ message, onImageClick }: MessageItemProps) {
  const alignment = message.isFromMe ? "flex-end" : "flex-start";
  const backgroundColor = message.isFromMe ? 'var(--mantine-color-secondary-5)' : 'white';
  const textColor = message.isFromMe ? 'white' : 'black';
  const borderRadius = message.isFromMe ? '12px 12px 0 12px' : '12px 12px 12px 0';

  return (
    <div style={{ display: 'flex', justifyContent: alignment }} data-testid="message-item">
      <Box
        style={{
          maxWidth: '75%',
          borderRadius,
          padding: '12px',
          backgroundColor,
          color: textColor,
          border: message.isFromMe ? 'none' : '1px solid var(--mantine-color-gray-2)',
        }}
      >
        {message.type === "text" ? (
          <TextMessageBubble message={message} />
        ) : (
          <ImageMessageBubble message={message} onImageClick={onImageClick} />
        )}
        <Text
          size="xs"
          mt="xs"
          c={message.isFromMe ? 'rgba(255, 255, 255, 0.7)' : 'dimmed'}
        >
          {DateTime.fromISO(message.timestamp).toLocaleString(DateTime.DATETIME_MED)}
        </Text>
      </Box>
    </div>
  );
}
