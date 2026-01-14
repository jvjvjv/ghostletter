"use client";

import { useRouter } from "next/navigation";
import { Paper, Group, ActionIcon, Text } from "@mantine/core";
import { IconChevronLeft } from "@tabler/icons-react";

import type { Friend } from "@/types/Friend";
import Avatar from "@/components/Avatar";

interface ChatHeaderProps {
  friend: Friend | null;
}

export default function ChatHeader({ friend }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <Paper
      shadow="xs"
      p="md"
      style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
    >
      <Group gap="md">
        <ActionIcon
          onClick={() => router.push("/main/chat")}
          variant="subtle"
          size="lg"
        >
          <IconChevronLeft size={30} />
        </ActionIcon>

        {friend && (
          <Group gap="sm">
            <Avatar friend={friend} size={10} />
            <Text fw={600}>{friend.name}</Text>
          </Group>
        )}
      </Group>
    </Paper>
  );
}
