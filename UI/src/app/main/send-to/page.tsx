"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import Avatar from "@/components/Avatar";
import store from "@/store";
import { sendMessageThunk } from "@/store/messagesSlice";
import { uploadImage } from "@/clientApi/images";
import { useAppSelector } from "@/store/hooks";


const state = store.getState();
const friends = state.friends.friends;

export default function SendToView() {
  const router = useRouter();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    // Retrieve the captured image from storage
    const storedImage = localStorage.getItem("ghostLetterLastPhoto");
    const storedFileData = localStorage.getItem("ghostLetterLastPhotoFile");

    if (storedImage) {
      setCapturedImage(storedImage);

      // Convert base64 back to File object if available
      if (storedFileData) {
        try {
          const fileData = JSON.parse(storedFileData);
          fetch(storedImage)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], fileData.name, { type: fileData.type });
              setImageFile(file);
            });
        } catch (e) {
          console.error("Failed to restore file:", e);
        }
      }
    } else {
      // If no image is found, redirect back to camera
      router.push("/main/camera");
    }
  }, [router]);

  const sendToFriend = async (friendId: number) => {
    if (!currentUser || !imageFile || sending) return;

    setSending(true);
    const friendName = friends.find((f) => f.id === friendId)?.name;

    try {
      // Step 1: Upload the image to the API
      const uploadResult = await uploadImage(imageFile);

      // Step 2: Send message with the image ID
      await store.dispatch(
        sendMessageThunk({
          recipientId: friendId,
          content: "Photo",
          type: "image",
          imageId: uploadResult.id,
          currentUserId: currentUser.id,
        })
      ).unwrap();

      // Show success notification
      if (typeof window !== "undefined") {
        const notification = document.createElement("div");
        notification.className =
          "fixed bottom-20 left-0 right-0 mx-auto w-64 bg-green-500 text-white p-4 rounded-lg text-center";
        notification.style.zIndex = "9999";
        notification.innerHTML = `<p>Sent to ${friendName}!</p>`;
        document.body.appendChild(notification);

        // Remove notification and cleanup after 2 seconds
        setTimeout(() => {
          notification.remove();
          // Clear the stored image
          localStorage.removeItem("ghostLetterLastPhoto");
          localStorage.removeItem("ghostLetterLastPhotoFile");
          // Go back to camera view
          router.push("/main/camera");
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to send image:", error);

      // Show error notification
      if (typeof window !== "undefined") {
        const notification = document.createElement("div");
        notification.className =
          "fixed bottom-20 left-0 right-0 mx-auto w-64 bg-red-500 text-white p-4 rounded-lg text-center";
        notification.style.zIndex = "9999";
        notification.innerHTML = `<p>Failed to send image. Please try again.</p>`;
        document.body.appendChild(notification);

        setTimeout(() => {
          notification.remove();
        }, 3000);
      }

      setSending(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="border-b border-gray-200 bg-white p-4">
        <h1 className="text-center text-xl font-semibold">Send To</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {sending ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">Sending image...</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>
    </div>
  );
}
