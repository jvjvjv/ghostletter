"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Paper, Group, ActionIcon, TextInput } from "@mantine/core";
import { IconSend, IconCamera } from "@tabler/icons-react";

interface MessageBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export default function MessageBar({ value, onChange, onSend }: MessageBarProps) {
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Paper
      pos="absolute"
      bottom={64}
      w="100%"
      p="md"
      style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
    >
      <Group gap="xs" wrap="nowrap">
        <TextInput
          flex={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          radius="xl"
        />
        <ActionIcon
          onClick={onSend}
          disabled={!value.trim()}
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
  );
}
