import React from "react";

import type { Friend } from "@/types/Friend";

export interface AvatarProps {
  friend: Friend;
  size: 8 | 10 | 12;
  className?: string;
}

const Avatar = (props: AvatarProps) => {
  const { friend } = props;
  const hasImage = !!friend.imageUrl;
  const size = `h-${props.size} w-${props.size}`;
  const textSize = `text-${props.size == 12 ? "md" : props.size == 10 ? "sm" : "xs"}`;
  return (
    <div
      className={`${friend.color} flex ${size} items-center justify-center rounded-full ${textSize} text-white ${props.className ?? ""} ${hasImage ? "bg-cover bg-center" : ""}`
        .replace(/ {2,}/g, " ")
        .trim()}
      style={{ backgroundImage: hasImage ? `url(${friend.imageUrl})` : "none" }}
    >
      {!hasImage ? friend.initials : null}
    </div>
  );
};

export default Avatar;
