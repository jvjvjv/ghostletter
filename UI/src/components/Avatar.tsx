import React from "react";
import { Avatar as MantineAvatar } from '@mantine/core';

import type { Friend } from "@/types/Friend";

export interface AvatarProps {
  friend: Friend;
  size: 8 | 10 | 16 | 24;
  className?: string;
}

/**
 * Calculates relative luminance of a color to determine optimal text contrast
 * Based on WCAG guidelines: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
const getTextColor = (backgroundColor: string): string => {
  // Parse hex color (#RGB or #RRGGBB)
  let hex = backgroundColor.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Convert to linear RGB
  const toLinear = (val: number) => (val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4));

  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);

  // Calculate relative luminance
  const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;

  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? "var(--foreground)" : "var(--background)";
};

const Avatar = (props: AvatarProps) => {
  const { friend, size, className } = props;

  // Map Tailwind sizes to pixels (Tailwind's size-8 = 2rem = 32px)
  const sizeMap = {
    8: 32,   // 2rem
    10: 40,  // 2.5rem
    16: 64,  // 4rem
    24: 96,  // 6rem
  };

  const textColor = friend.imageUrl ? "#ffffff" : getTextColor(friend.color);

  return (
    <MantineAvatar
      src={friend.imageUrl}
      size={sizeMap[size]}
      radius="100%"
      className={className}
      styles={{
        root: {
          backgroundColor: friend.color,
          color: textColor,
        },
      }}
    >
      {!friend.imageUrl && friend.initials}
    </MantineAvatar>
  );
};

export default Avatar;
