import { Barlow, Cousine } from "next/font/google";

import type { Metadata } from "next";

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
        <body className={`${barlow.variable} ${mono.variable} antialiased`}>{children}</body>
      </html>
    </StoreProvider>
  );
}
