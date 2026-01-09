"use client";

import type { ChatPreview } from "@/types/ChatPreview";
import type { Friend } from "@/types/Friend";
import Image from "next/image";
import { Stack, Text, Title, Divider, Center, Button } from '@mantine/core';

import ChatPreviewItem from "./ChatPreviewItem";

type ChatListContentProps = {
  chats: Array<ChatPreview>;
  isLoading: boolean;
  onChatSelect: (chatId: number) => void;
  onTakePhoto: () => void;
  getFriendById: (id: number) => Friend | undefined;
};

export default function ChatListContent({
  chats,
  getFriendById,
  isLoading,
  onChatSelect,
  onTakePhoto,
}: ChatListContentProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (!isLoading && chats.length === 0) {
    return <EmptyState onTakePhoto={onTakePhoto} />;
  }

  return (
    <Stack gap={0}>
      {chats.map((chat, index) => {
        const friend = getFriendById(chat.id);
        if (!friend) return null;

        return (
          <div key={chat.id}>
            <ChatPreviewItem chat={chat} friend={friend} onSelect={onChatSelect} />
            {index < chats.length - 1 && <Divider />}
          </div>
        );
      })}
    </Stack>
  );
}

function LoadingState() {
  return (
    <Center h="100%" p="lg">
      <Stack align="center" gap="md">
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          backgroundColor: 'var(--mantine-color-secondary-5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Image priority src="/ghostletter.svg" width={96} height={96} alt="Ghostletter ghost" />
        </div>
        <Text c="dimmed">Loading chats...</Text>
      </Stack>
    </Center>
  );
}

function EmptyState({ onTakePhoto }: { onTakePhoto: () => void }) {
  return (
    <Center h="100%" p="lg">
      <Stack align="center" gap="md">
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          backgroundColor: 'var(--mantine-color-secondary-5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Image priority src="/ghostletter-frown.svg" width={96} height={96} alt="Ghostletter ghost, frowning" />
        </div>
        <Title order={3}>No chats yet</Title>
        <Text c="dimmed" ta="center">Start taking photos and sending them to friends!</Text>
        <Button onClick={onTakePhoto}>Take a Photo</Button>
      </Stack>
    </Center>
  );
}
