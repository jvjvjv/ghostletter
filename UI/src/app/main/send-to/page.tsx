"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { addMessage } from "@/store/messagesSlice";
import store from "@/store";

import Avatar from "@/components/Avatar";

const state = store.getState();
const friends = state.friends.friends;

export default function SendToView() {
  const router = useRouter();
  const [, setCapturedImage] = useState<string | null>(null);

  // Sample friends data - in a real app this would come from API/database
  useEffect(() => {
    // Retrieve the captured image from storage
    const storedImage = localStorage.getItem("ghostLetterLastPhoto");
    if (storedImage) {
      setCapturedImage(storedImage);
    } else {
      // If no image is found, redirect back to camera
      router.push("/main/camera");
    }
  }, [router]);

  const sendToFriend = (friendId: number) => {
    // In a real app, you would send the image to this friend

    // Mock successful send
    const friendName = friends.find((f) => f.id === friendId)?.name;

    store.dispatch(
      addMessage({
        id: 0,
        friendId: friendId,
        content: "You sent a photo",
        isFromMe: true,
        isRead: true,
        timestamp: new Date().toISOString(),
        type: "image",
        imageUrl: localStorage.getItem("ghostLetterLastPhoto") || "",
      }),
    );

    // Show quick notification
    if (typeof window !== "undefined") {
      const notification = document.createElement("div");
      notification.className =
        "fixed bottom-20 left-0 right-0 mx-auto w-64 bg-green-500 text-white p-4 rounded-lg text-center";
      notification.style.zIndex = "9999";
      notification.innerHTML = `<p>Sent to ${friendName}!</p>`;
      document.body.appendChild(notification);

      // Remove notification after 2 seconds
      setTimeout(() => {
        notification.remove();
        // Clear the stored image
        localStorage.removeItem("ghostLetterLastPhoto");
        // Go back to camera view
        router.push("/main/camera");
      }, 2000);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="border-b border-gray-200 bg-white p-4">
        <h1 className="text-center text-xl font-semibold">Send To</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <p className="mb-2 text-sm text-gray-500">All Friends</p>
        <div className="space-y-2">
          {friends.map((friend) => (
            <div
              key={friend.id}
              onClick={() => sendToFriend(friend.id)}
              className="flex w-full cursor-pointer items-center gap-4 rounded-lg p-3 transition hover:bg-gray-50"
            >
              <Avatar friend={friend} size={10} />
              <span>{friend.name}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
