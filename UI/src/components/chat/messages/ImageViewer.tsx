"use client";

import Image from "next/image";
import { RingProgress, Text } from "@mantine/core";

const THRESHOLD = 10; // Total countdown seconds

interface ImageViewerProps {
  imageUrl: string;
  countdown: number;
  onExpired: () => void;
}

export default function ImageViewer({
  imageUrl,
  countdown,
  onExpired,
}: ImageViewerProps) {
  // Calculate progress percentage (100% = full, 0% = expired)
  const progressValue = (countdown / THRESHOLD) * 100;

  // Auto-close when expired
  if (countdown <= 0) {
    onExpired();
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "black",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Fullscreen image */}
      <Image
        src={imageUrl}
        alt="Viewing photo"
        fill
        style={{ objectFit: "contain" }}
        unoptimized
      />

      {/* Countdown timer in bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          right: 32,
        }}
      >
        <RingProgress
          size={80}
          thickness={6}
          roundCaps
          sections={[{ value: progressValue, color: "white" }]}
          label={
            <Text c="white" fw={700} ta="center" size="lg">
              {countdown}
            </Text>
          }
        />
      </div>
    </div>
  );
}
