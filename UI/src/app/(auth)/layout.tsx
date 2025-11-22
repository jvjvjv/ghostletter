import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth | Ghost Letter",
  description: "Send private, disappearing messages to everyone!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
