"use client";

import type { ChatPreview } from "@/types/ChatPreview";
import type { Friend } from "@/types/Friend";

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
    <div className="divide-y divide-gray-100">
      {chats.map((chat) => {
        const friend = getFriendById(chat.id);
        if (!friend) return null;

        return <ChatPreviewItem key={chat.id} chat={chat} friend={friend} onSelect={onChatSelect} />;
      })}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
        <span className="text-2xl">⏳</span>
      </div>
      <p className="text-gray-500">Loading chats...</p>
    </div>
  );
}

function EmptyState({ onTakePhoto }: { onTakePhoto: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
        <span className="text-2xl">👻</span>
      </div>
      <h3 className="mb-2 text-lg font-semibold">No chats yet</h3>
      <p className="mb-4 text-gray-500">Start taking photos and sending them to friends!</p>
      <button onClick={onTakePhoto} className="button-submit">
        Take a Photo
      </button>
    </div>
  );
}
