import React from "react";

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
  const { friend } = props;

  // Map size to font size in rem (Tailwind equivalents)
  const fontSizeMap = {
    8: "0.875rem", // text-sm
    10: "1rem", // text-base (md)
    16: "1.75rem", // text-lg
    24: "2.5rem",
  };

  const hasImage = !!friend.imageUrl;
  const sizeInRem = props.size / 4; // Convert Tailwind size to rem (4px = 0.25rem base)
  const textColor = hasImage ? "#ffffff" : getTextColor(friend.color);

  return (
    <div
      className={`flex items-center justify-center rounded-full ${props.className ?? ""} ${hasImage ? "bg-cover bg-center" : ""}`}
      style={{
        width: `${sizeInRem}rem`,
        height: `${sizeInRem}rem`,
        fontSize: fontSizeMap[props.size],
        background: hasImage ? `url(${friend.imageUrl})` : friend.color,
        color: textColor,
      }}
    >
      {!hasImage ? friend.initials : null}
    </div>
  );
};;;;;;;;;;;;;

export default Avatar;
