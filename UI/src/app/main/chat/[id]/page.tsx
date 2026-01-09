"use client";

import { useRouter } from "next/navigation";
import React, { use, useState, useEffect, useRef, useCallback } from "react";
import { Paper, Group, ActionIcon, TextInput, Stack, Text } from '@mantine/core';
import { IconArrowLeft, IconSend, IconCamera } from '@tabler/icons-react';

import type { Friend } from "@/types/Friend";
import type { Message } from "@/types/Message";

import Avatar from "@/components/Avatar";
import MessageItem from "@/components/chat/messages/MessageItem";
import store from "@/store";
import { selectFriendById } from "@/store/friendsSlice";
import {
  addMessage,
  selectMessageById,
  selectMessagesByFriendId,
  updateMessage,
  fetchConversationThunk,
  sendMessageThunk,
  markReadThunk,
  markViewedThunk,
} from "@/store/messagesSlice";
import { useAppSelector } from "@/store/hooks";

const THRESHOLD = 10; // seconds

interface ChatDetailProps {
  id: string;
}

type ChatDetailPageProps = {
  params: Promise<ChatDetailProps>;
};

export default function ChatDetailView(props: ChatDetailPageProps) {
  const { id } = use(props.params);
  const chatId = parseInt(id);
  const router = useRouter();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [imageViewTimers, setImageViewTimers] = useState<Record<string, NodeJS.Timeout>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useAppSelector((state) => state.auth.authenticatedUser);
  const conversationLoading = useAppSelector((state) => state.messages.conversationLoading[chatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat data
  useEffect(() => {
    // Clean up any active timers when component unmounts
    return () => {
      for (const key in imageViewTimers) {
        switch (key.substring(0, 1) as "t" | "i") {
          case "t":
            clearTimeout(imageViewTimers[key]);
            break;
          case "i":
            clearInterval(imageViewTimers[key]);
            break;
        }
      }
    };
  }, [imageViewTimers]);

  // Helper function to get chat messages
  const getMessagesByFriendId = useCallback(
    (friendId: number): Array<Message> => {
      const msgs = selectMessagesByFriendId(store.getState(), friendId);
      setMessages(msgs);
      for (const msg of msgs) {
        if (msg.type === "image") {
          if (msg.imgViewed && msg.expiryTimestamp && msg.countdown) {
            startImageCountdown(msg.id, msg.expiryTimestamp, msg.countdown);
          }
          continue;
        }
        // Mark text messages as read via API if not from current user
        if (!msg.isRead && !msg.isFromMe && currentUser) {
          store.dispatch(markReadThunk({ messageId: msg.id, currentUserId: currentUser.id }));
        }
        updateMessageLocalAndStore({ ...msg, isRead: true });
      }
      return msgs;
    },
    [currentUser],
  );

  // Helper function to get friend details (mock data)
  const getFriendById = useCallback((id: number): Friend => {
    const friend = selectFriendById(store.getState(), id);
    if (!friend) throw new ReferenceError(`Friend with ID ${id} not found`);
    return friend;
  }, []);

  const updateMessageLocalAndStore = (message: Message) => {
    store.dispatch(updateMessage(message));
    setMessages((prevMessages) => prevMessages.map((msg) => (msg.id === message.id ? { ...msg, ...message } : msg)));
  };

  useEffect(() => {
    // Fetch friend details - may not exist in store yet during deep link
    try {
      const friendDetails = getFriendById(chatId);
      setFriend(friendDetails);
    } catch {
      // Friend not in store yet - will be populated when friends list loads
      console.warn("Friend not yet loaded:", chatId);
    }

    // Fetch conversation from API
    if (currentUser) {
      store.dispatch(fetchConversationThunk({ friendId: chatId, currentUserId: currentUser.id })).then(() => {
        // After fetching, get the messages from store
        getMessagesByFriendId(chatId);
      });
    }
  }, [chatId, currentUser, getFriendById, getMessagesByFriendId]);

  const startImageCountdown = (messageId: number, expiryTime: number, countdown: number) => {
    const msg = selectMessageById(store.getState(), messageId);
    if (!msg) throw new ReferenceError(`Unexpected error: Message with ID ${messageId} not found`);
    // Set timeout to mark the image as expired after 60 seconds
    const timer = setTimeout(() => {
      updateMessageLocalAndStore({
        ...msg,
        isRead: true,
        imgViewed: true,
        expiryTimestamp: expiryTime,
        status: "expired",
        countdown: 0,
      });
    }, 60000);
    // Store timer reference for cleanup
    setImageViewTimers((prev) => ({ ...prev, [`t${messageId}`]: timer }));
    // Show countdown timer
    let secondsLeft = countdown;
    const countdownInterval = setInterval(() => {
      secondsLeft -= 1;
      updateMessageLocalAndStore({
        ...msg,
        isRead: true,
        imgViewed: true,
        expiryTimestamp: expiryTime,
        countdown: secondsLeft,
      });
      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
    setImageViewTimers((prev) => ({ ...prev, [`i${messageId}`]: countdownInterval }));
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || !currentUser) return;

    const content = newMessage;
    setNewMessage(""); // Clear input immediately for better UX

    // Send message via API
    try {
      await store
        .dispatch(
          sendMessageThunk({
            recipientId: chatId,
            content,
            type: "text",
            currentUserId: currentUser.id,
          }),
        )
        .unwrap();

      // Refresh messages from store
      setMessages(selectMessagesByFriendId(store.getState(), chatId));
    } catch (error) {
      console.error("Failed to send message:", error);
      setNewMessage(content); // Restore message on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageClick = async (messageId: number, expiryTimestamp?: number) => {
    const now = Date.now();
    const msg = selectMessageById(store.getState(), messageId);
    if (!msg) throw new ReferenceError(`Unexpected error: Message with ID ${messageId} not found`);
    // Check if image is already expired
    if (expiryTimestamp && expiryTimestamp < now) {
      updateMessageLocalAndStore({
        ...msg,
        isRead: true,
        imgViewed: true,
        expiryTimestamp: expiryTimestamp,
        status: "expired",
      });
      return;
    }
    // If this is the first view, set up the 60-second timer
    if (!msg.imgViewed) {
      const expiryTime = now + THRESHOLD * 1000; // 60 seconds
      // Update message store and update state
      updateMessageLocalAndStore({
        ...msg,
        isRead: true,
        imgViewed: true,
        expiryTimestamp: expiryTime,
        countdown: THRESHOLD,
      });

      // Mark as viewed via API
      if (currentUser) {
        try {
          await store.dispatch(markViewedThunk({ messageId, currentUserId: currentUser.id })).unwrap();
        } catch (error) {
          console.error("Failed to mark image as viewed:", error);
        }
      }

      startImageCountdown(messageId, expiryTime, THRESHOLD);
    }
  };

  return (
    <Stack gap={0} h="100vh" pos="relative">
      {/* Header with friend info */}
      <Paper shadow="xs" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
        <Group gap="md">
          <ActionIcon onClick={() => router.push("/main/chat")} variant="subtle" size="lg">
            <IconArrowLeft size={20} />
          </ActionIcon>

          {friend && (
            <Group gap="sm">
              <Avatar friend={friend} size={10} />
              <Text fw={600}>{friend.name}</Text>
            </Group>
          )}
        </Group>
      </Paper>

      {/* Message list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {conversationLoading ? (
          <Stack align="center" justify="center" h="100%">
            <Text c="dimmed">Loading messages...</Text>
          </Stack>
        ) : (
          <Stack gap="md">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} onImageClick={handleImageClick} />
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        )}
      </div>

      {/* Message input */}
      <Paper pos="absolute" bottom={64} w="100%" p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
        <Group gap="xs" wrap="nowrap">
          <TextInput
            flex={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            radius="xl"
          />
          <ActionIcon
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            color="secondary"
            variant="filled"
            size="lg"
            radius="xl"
          >
            <IconSend size={18} />
          </ActionIcon>
          <ActionIcon
            onClick={() => router.push("/main/camera")}
            color="secondary"
            variant="light"
            size="lg"
            radius="xl"
          >
            <IconCamera size={18} />
          </ActionIcon>
        </Group>
      </Paper>
    </Stack>
  );
}
