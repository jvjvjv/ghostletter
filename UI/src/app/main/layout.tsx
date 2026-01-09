import { IconMapPin, IconMessages, IconCamera, IconUsers, IconSettings } from '@tabler/icons-react';
import { Paper, Group } from '@mantine/core';

import NavButton from "@/components/NavButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Paper
        component="nav"
        pos="absolute"
        bottom={0}
        left={0}
        style={{
          zIndex: 10,
          height: '64px',
          width: '100%',
          overflow: 'hidden',
          borderTop: '1px solid var(--mantine-color-gray-2)',
          backgroundColor: 'var(--mantine-color-gray-1)',
        }}
      >
        <Group gap={0} bg={'primary'} justify="space-around" align="center" h="100%">
          <NavButton
            active={false}
            icon={<IconMapPin size={20} />}
            label=""
            action="/main/chat"
            disabled
            tooltip="Share your location: Disabled for this demo"
          />
          <NavButton active={false} icon={<IconMessages size={20} />} label="" action="/main/chat" tooltip="Chats" />
          <NavButton active={false} icon={<IconCamera size={20} />} label="" action="/main/camera" tooltip="Camera" />
          <NavButton active={false} icon={<IconUsers size={20} />} label="" action="/main/chat" disabled tooltip="Your Stories" />
          <NavButton active={false} icon={<IconSettings size={20} />} label="" action="/main/settings" tooltip="Settings" />
        </Group>
      </Paper>
    </>
  );
}
