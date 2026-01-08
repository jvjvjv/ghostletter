"use client";

import { useRouter } from "next/navigation";
import React from "react";
import { Stack, Paper, Title, Center, Text, TextInput, Button } from '@mantine/core';

import Avatar from "@/components/Avatar";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logoutThunk } from "@/store/authSlice";

export default function SettingsView() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.authenticatedUser);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    router.push("/signin");
  };

  if (!currentUser) {
    return (
      <Center h="100vh">
        <Text c="dimmed">Loading...</Text>
      </Center>
    );
  }

  return (
    <Stack gap={0} h="100vh" pos="relative">
      <Paper shadow="xs" p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}>
        <Title order={1} ta="center" size="h3">Settings</Title>
      </Paper>
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar friend={currentUser} size={24} />
        <Stack gap="md" mt="md" w="100%" maw={400}>
          <TextInput
            label="Name"
            id="name"
            value={currentUser.name}
            readOnly
          />
          <TextInput
            label="Username"
            id="username"
            value={currentUser.username}
            readOnly
          />
          <TextInput
            label="Email"
            id="email"
            type="email"
            value={currentUser.email}
            readOnly
          />
        </Stack>
        <Button onClick={handleLogout} style={{ marginTop: '2rem' }}>
          Log Out
        </Button>
      </div>
    </Stack>
  );
}
