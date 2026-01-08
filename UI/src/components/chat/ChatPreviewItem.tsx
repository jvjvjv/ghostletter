"use client";

import { DateTime } from "luxon";
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
    <div
      onClick={() => onSelect(chat.id)}
      className="flex w-full cursor-pointer items-center gap-4 p-2 transition hover:bg-gray-50"
    >
      <Avatar friend={friend} size={10} />

      <div className="flex flex-1 flex-col items-start text-left">
        <div className="mb-1 flex w-full justify-between">
          <span className="font-medium">{chat.name}</span>
          <span className="text-xs text-gray-500">{DateTime.fromISO(chat.timestamp).toRelative()}</span>
        </div>
        <div className="flex items-center">
          <p className="text-sm text-gray-600">{truncateMessage(chat.lastMessage)}</p>
          {chat.hasUnread && <span className="bg-secondary ml-2 h-2 w-2 rounded-full"></span>}
        </div>
      </div>
    </div>
  );
}
