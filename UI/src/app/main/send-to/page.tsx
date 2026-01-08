"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Stack, Paper, Title, Text, UnstyledButton, Group, Center, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';

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
  const currentUser = useAppSelector((state) => state.auth.authenticatedUser);

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
            .then((res) => res.blob())
            .then((blob) => {
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
      await store
        .dispatch(
          sendMessageThunk({
            recipientId: friendId,
            content: "Photo",
            type: "image",
            imageId: uploadResult.id,
            currentUserId: currentUser.id,
          }),
        )
        .unwrap();

      // Show success notification
      notifications.show({
        title: 'Success',
        message: `Sent to ${friendName}!`,
        color: 'green',
        autoClose: 2000,
      });

      // Cleanup after 2 seconds
      setTimeout(() => {
        // Clear the stored image
        localStorage.removeItem("ghostLetterLastPhoto");
        localStorage.removeItem("ghostLetterLastPhotoFile");
        // Go back to camera view
        router.push("/main/camera");
      }, 2000);
    } catch (error) {
      console.error("Failed to send image:", error);

      // Show error notification
      notifications.show({
        title: 'Error',
        message: 'Failed to send image. Please try again.',
        color: 'red',
        autoClose: 3000,
      });

      setSending(false);
    }
  };

  return (
    <Stack gap={0} h="100vh" pos="relative">
      <Paper shadow="xs" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
        <Title order={1} ta="center" size="h3">Send To</Title>
      </Paper>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {sending ? (
          <Center h="100%">
            <Stack align="center" gap="md">
              <Loader color="secondary" />
              <Text c="dimmed">Sending image...</Text>
            </Stack>
          </Center>
        ) : (
          <Stack gap="md">
            <Text size="sm" c="dimmed">All Friends</Text>
            <Stack gap="xs">
              {friends.map((friend) => (
                <UnstyledButton
                  key={friend.id}
                  onClick={() => sendToFriend(friend.id)}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    padding: '12px',
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
                  <Group gap="md">
                    <Avatar friend={friend} size={10} />
                    <Text>{friend.name}</Text>
                  </Group>
                </UnstyledButton>
              ))}
            </Stack>
          </Stack>
        )}
      </div>
    </Stack>
  );
}
