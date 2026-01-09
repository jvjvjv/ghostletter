import { Barlow, Cousine } from "next/font/google";

import type { Metadata } from "next";

import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

import { theme } from '@/theme/mantine-theme';
import { StoreProvider } from "@/providers/StoreProvider";

import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const mono = Cousine({
  variable: "--font-cousine",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Ghost Letter",
  description: "Send private, disappearing messages to everyone!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <html lang="en">
        <head>
          <ColorSchemeScript />
        </head>
        <body className={`${barlow.variable} ${mono.variable} antialiased`}>
          <MantineProvider theme={theme}>
            <Notifications />
            {children}
          </MantineProvider>
        </body>
      </html>
    </StoreProvider>
  );
}
