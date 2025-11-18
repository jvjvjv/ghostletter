import type { Metadata } from "next";

import { StoreProvider } from "@/store/StoreProvider";

import "./globals.css";

// Temporarily using system fonts due to Google Fonts network restrictions
// To re-enable Google Fonts, uncomment the following:
// import { Barlow, Cousine } from "next/font/google";
// const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "700"] });
// const mono = Cousine({ variable: "--font-cousine", subsets: ["latin"], weight: ["400", "700"] });

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
        <body className="antialiased" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
          {children}
        </body>
      </html>
    </StoreProvider>
  );
}
