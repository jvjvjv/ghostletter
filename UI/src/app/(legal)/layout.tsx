"use client";

import { useRouter } from "next/navigation";

import "../globals.css";
import "./legal.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  return (
    <>
      {children}
      <hr />
      <button onClick={() => router.back()} className="p-1">
        Back
      </button>
    </>
  );
}
