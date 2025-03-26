"use client";

import React, { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { DateTime } from "luxon";

import type { Friend } from "@/types/Friend";
import type { Message } from "@/types/Message";

import { selectFriendById } from "@/store/friendsSlice";
import { addMessage, selectMessageById, selectMessagesByFriendId, updateMessage } from "@/store/messagesSlice";
import store from "@/store";

import Avatar from "@/components/Avatar";

const THRESHOLD = 10; // seconds

interface ChatDetailProps {
  id: string;
}

type ChatDetailPageProps = {
  params: Promise<ChatDetailProps>;
};

export default function ChatDetailView(props: ChatDetailPageProps) {
  const state = store.getState();
  const { id } = use(props.params);
  const chatId = parseInt(id);
  const router = useRouter();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [newMessage, setNewMessage] = useState("");
  const [imageViewTimers, setImageViewTimers] = useState<Record<string, NodeJS.Timeout>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

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

  // Helper function to get chat messages (mock data)
  const getMessagesByFriendId = useCallback((friendId: number): Array<Message> => {
    const msgs = selectMessagesByFriendId(store.getState(), friendId);
    setMessages(msgs);
    for (const msg of msgs) {
      if (msg.type === "image") {
        if (msg.imgViewed && msg.expiryTimestamp && msg.countdown) {
          startImageCountdown(msg.id, msg.expiryTimestamp, msg.countdown);
        }
        continue;
      }
      updateMessageLocalAndStore({ ...msg, isRead: true });
    }
    return msgs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // In a real app, fetch friend details and messages from API/database
    // Get conversation based on friend ID
    const friendDetails = getFriendById(chatId);
    setFriend(friendDetails);
    getMessagesByFriendId(chatId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

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
    setImageViewTimers((prev) => ({ ...prev, [`i${messageId} }`]: countdownInterval }));
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    store.dispatch(
      addMessage({
        id: 0,
        content: newMessage,
        friendId: getFriendById(chatId).id || 0,
        isFromMe: true,
        isRead: true,
        timestamp: new Date().toISOString(),
        type: "text",
      }),
    );

    setMessages(selectMessagesByFriendId(store.getState(), chatId));
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageClick = (messageId: number, expiryTimestamp?: number) => {
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

      startImageCountdown(messageId, expiryTime, THRESHOLD);
    }
  };

  return (
    <div className="page relative p-0">
      {/* Header with friend info */}
      <header className="flex items-center border-b border-gray-200 bg-white p-4">
        <button onClick={() => router.push("/main/chat")} className="mr-3">
          ←
        </button>

        {friend && (
          <div className="flex items-center gap-3">
            <Avatar friend={friend} size={10} />
            <span className="font-semibold">{friend.name}</span>
          </div>
        )}
      </header>

      {/* Message list */}
      <main className="h-full overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isFromMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-lg p-3 ${
                  message.isFromMe
                    ? "rounded-br-none bg-indigo-500 text-white"
                    : "rounded-bl-none border border-gray-200 bg-white"
                }`}
              >
                {message.type === "text" ? (
                  <p>{message.content}</p>
                ) : (
                  <div className="relative">
                    {/* For image messages */}
                    {message.imageUrl && !message.expiryTimestamp ? (
                      <div className="relative">
                        <button
                          className="button-submit rounded p-2"
                          onClick={() => handleImageClick(message.id, message.expiryTimestamp)}
                        >
                          Click to view photo
                        </button>
                      </div>
                    ) : message.imageUrl && message.countdown && message.expiryTimestamp ? (
                      <div className="relative overflow-hidden">
                        <Image
                          id={`image-${message.id}`}
                          src={message.imageUrl}
                          alt={message.imageDescription || "Photo"}
                          width={300}
                          height={240}
                          className={`max-h-64 w-auto max-w-xs cursor-pointer rounded object-cover transition-all duration-300 ${
                            message.expiryTimestamp < Date.now() ? "blur-xl" : ""
                          }`}
                        />
                        {/* Countdown overlay */}
                        <div
                          id={`countdown-${message.id}`}
                          className={`bg-opacity-70 absolute top-2 right-2 rounded-full bg-black px-2 py-1 text-xs text-white ${
                            message.imgViewed ? "" : "hidden"
                          }`}
                        >
                          {message.expiryTimestamp < Date.now() ? "Expired" : message.countdown + "s"}
                        </div>
                      </div>
                    ) : message.imageUrl && message.status == "expired" ? (
                      <p className="text-gray-500 italic">Photo expired</p>
                    ) : (
                      <p className="text-gray-500 italic">Photo unavailable</p>
                    )}
                  </div>
                )}
                <div className={`mt-1 text-xs ${message.isFromMe ? "text-indigo-200" : "text-gray-500"}`}>
                  {DateTime.fromISO(message.timestamp).toLocaleString(DateTime.DATETIME_MED)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Message input */}
      <footer className="absolute bottom-16 w-full border-t border-gray-200 bg-white p-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              newMessage.trim() ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-400"
            }`}
          >
            →
          </button>
          <button
            onClick={() => router.push("/main/camera")}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-500"
          >
            📷
          </button>
        </div>
      </footer>
    </div>
  );
}
