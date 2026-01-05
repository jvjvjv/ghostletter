"use client";

import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";

import type { ChatPreview } from "@/types/ChatPreview";
import type { Friend } from "@/types/Friend";
import type { Message } from "@/types/Message";

import Avatar from "@/components/Avatar";
import store from "@/store";
import { selectAuthUser } from "@/store/authSlice";
import {
  selectFriendById,
  selectFriendsLoading,
  fetchFriendsThunk,
} from "@/store/friendsSlice";
import {
  selectMessages,
  selectMessagesLoading,
  fetchAllMessagesThunk,
} from "@/store/messagesSlice";


export default function ChatListView() {
  const router = useRouter();
  const [chats, setChats] = useState<Array<ChatPreview>>([]);

  // Get current user and loading states from Redux
  const currentUser = useSelector(selectAuthUser);
  const friendsLoading = useSelector(selectFriendsLoading);
  const messagesLoading = useSelector(selectMessagesLoading);

  const isLoading = friendsLoading || messagesLoading;

  // Helper function to get friend details by ID
  const getFriendById = useCallback(
    (id: number): Friend | undefined => {
      const state = store.getState();
      return selectFriendById(state, id);
    },
    [],
  );

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
            lastMessage: chat.content,
            timestamp: chat.timestamp,
            hasUnreadImage: chat.type === "image" && !chat.isRead && !chat.isFromMe,
            hasUnreadMessage: chat.type === "text" && !chat.isRead && !chat.isFromMe,
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

  const truncateMessage = (message: string, maxLength: number = 40) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const openChat = (chatId: number) => {
    router.push(`/main/chat/${chatId}`);
  };

  const navigateTo = (route: string) => {
    router.push(route);
  };

  return (
    <div className="page p-0">
      <header className="border-b border-gray-200 bg-white p-4">
        <h1 className="text-center text-xl font-semibold">Chats</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-gray-500">Loading chats...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
              <span className="text-2xl">👻</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold">No chats yet</h3>
            <p className="mb-4 text-gray-500">
              Start taking photos and sending them to friends!
            </p>
            <button
              onClick={() => navigateTo("/main/camera")}
              className="button-submit"
            >
              Take a Photo
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {chats.map((chat) => {
              const friend = getFriendById(chat.id);
              if (!friend) return null;

              return (
                <div
                  key={chat.id}
                  onClick={() => openChat(chat.id)}
                  className="flex w-full cursor-pointer items-center gap-4 p-2 transition hover:bg-gray-50"
                >
                  {/* Avatar */}
                  <Avatar friend={friend} size={10} />

                  {/* Chat info */}
                  <div className="flex flex-1 flex-col items-start text-left">
                    <div className="mb-1 flex w-full justify-between">
                      <span className="font-medium">{chat.name}</span>
                      <span className="text-xs text-gray-500">
                        {DateTime.fromISO(chat.timestamp).toRelative()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <p className="text-sm text-gray-600">
                        {truncateMessage(chat.lastMessage)}
                      </p>

                      {/* Unread indicators */}
                      {chat.hasUnreadImage && (
                        <span className="ml-2 rounded-full bg-indigo-500 px-1.5 py-0.5 text-xs text-white">
                          📸
                        </span>
                      )}
                      {chat.hasUnreadMessage && (
                        <span className="ml-2 h-2 w-2 rounded-full bg-indigo-500"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
