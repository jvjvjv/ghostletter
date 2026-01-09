"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Stack, Paper, Title } from '@mantine/core';

import type { ChatPreview } from "@/types/ChatPreview";
import type { Friend } from "@/types/Friend";
import type { Message } from "@/types/Message";

import store from "@/store";
import { selectAuthUser } from "@/store/authSlice";
import { selectFriendById, selectFriendsLoading, fetchFriendsThunk } from "@/store/friendsSlice";
import { selectMessages, selectMessagesLoading, fetchAllMessagesThunk } from "@/store/messagesSlice";
import ChatListContent from "@/components/chat/ChatListContent";

export default function ChatListView() {
  const router = useRouter();
  const [chats, setChats] = useState<Array<ChatPreview>>([]);

  // Get current user and loading states from Redux
  const currentUser = useSelector(selectAuthUser);
  const friendsLoading = useSelector(selectFriendsLoading);
  const messagesLoading = useSelector(selectMessagesLoading);

  const isLoading = friendsLoading || messagesLoading;

  // Helper function to get friend details by ID
  const getFriendById = useCallback((id: number): Friend | undefined => {
    const state = store.getState();
    return selectFriendById(state, id);
  }, []);

  // Fetch friends and messages on mount
  useEffect(() => {
    if (currentUser) {
      store.dispatch(fetchFriendsThunk());
      store.dispatch(fetchAllMessagesThunk({ currentUserId: currentUser.id }));
    }
  }, [currentUser]);

  // Update chat previews when data changes
  useEffect(() => {
    const getChatPreviewsByFriend = (): Array<ChatPreview> => {
      const state = store.getState();
      const latestMessages: Map<number, Message> = new Map([]);
      const messages = selectMessages(state);

      // Find latest message for each friend
      messages.forEach((message) => {
        if (!latestMessages.has(message.friendId)) {
          latestMessages.set(message.friendId, message);
        } else {
          const existingMessage = latestMessages.get(message.friendId);
          if (existingMessage && message.timestamp > existingMessage.timestamp) {
            latestMessages.set(message.friendId, message);
          }
        }
      });

      const chatPreviews: Array<ChatPreview> = [];
      latestMessages.forEach((chat) => {
        const friendDetails = getFriendById(chat.friendId);
        if (friendDetails) {
          chatPreviews.push({
            id: chat.friendId,
            name: friendDetails.name,
            color: friendDetails.color,
            initials: friendDetails.initials,
            lastMessage: !chat.imageUrl ? chat.content : "📸",
            timestamp: chat.timestamp,
            hasUnread: !chat.isRead && !chat.isFromMe,
          });
        }
      });
      return chatPreviews;
    };

    const byDateDescending = (a: ChatPreview, b: ChatPreview) => {
      const aTimestamp = new Date(a.timestamp).getTime();
      const bTimestamp = new Date(b.timestamp).getTime();
      return bTimestamp - aTimestamp;
    };

    if (!isLoading) {
      setChats(getChatPreviewsByFriend().toSorted(byDateDescending));
    }

    // Re-run when store updates
    const unsubscribe = store.subscribe(() => {
      if (!isLoading) {
        setChats(getChatPreviewsByFriend().toSorted(byDateDescending));
      }
    });

    return unsubscribe;
  }, [getFriendById, isLoading]);

  const openChat = (chatId: number) => {
    router.push(`/main/chat/${chatId}`);
  };

  return (
    <Stack gap={0} h="100vh" p={0}>
      <Paper shadow="xs" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
        <Title order={1} ta="center" size="h3">Chats</Title>
      </Paper>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <ChatListContent
          chats={chats}
          getFriendById={getFriendById}
          isLoading={isLoading}
          onChatSelect={openChat}
          onTakePhoto={() => router.push("/main/camera")}
        />
      </div>
    </Stack>
  );
}
