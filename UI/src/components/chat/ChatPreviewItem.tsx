"use client";

import { DateTime } from "luxon";
import { UnstyledButton, Group, Stack, Text, Badge } from '@mantine/core';
import Avatar from "@/components/Avatar";
import type { ChatPreview } from "@/types/ChatPreview";
import type { Friend } from "@/types/Friend";

type ChatPreviewItemProps = {
  chat: ChatPreview;
  friend: Friend;
  onSelect: (id: number) => void;
};

const truncateMessage = (message: string, maxLength = 40) => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + "...";
};

export default function ChatPreviewItem({ chat, friend, onSelect }: ChatPreviewItemProps) {
  return (
    <UnstyledButton
      onClick={() => onSelect(chat.id)}
      w="100%"
      data-testid="chat-preview-item"
      style={{
        padding: '0.5rem',
        transition: 'background-color 0.2s',
      }}
      styles={{
        root: {
          '&:hover': {
            backgroundColor: 'var(--mantine-color-gray-0)',
          },
        },
      }}
    >
      <Group gap="md" wrap="nowrap">
        <Avatar friend={friend} size={10} />

        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          <Group justify="space-between" wrap="nowrap">
            <Text fw={500} truncate>{chat.name}</Text>
            <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
              {DateTime.fromISO(chat.timestamp).toRelative()}
            </Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Text size="sm" c="dimmed" truncate style={{ flex: 1 }}>
              {truncateMessage(chat.lastMessage)}
            </Text>
            {chat.hasUnread && <Badge color="secondary" size="xs" circle />}
          </Group>
        </Stack>
      </Group>
    </UnstyledButton>
  );
}
