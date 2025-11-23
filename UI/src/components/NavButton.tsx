"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

import type { IconProp } from "@fortawesome/fontawesome-svg-core";

import { navigateTo } from "@/lib/navigateTo";
// import { IconDefinition } from "@fortawesome/free-regular-svg-icons";
export interface NavButtonProps {
  active: boolean;
  icon: IconProp;
  label: string;
  action: string;
  disabled?: boolean;
  tooltip?: string;
}

const NavButton = ({ active, icon, label, action, disabled, tooltip }: NavButtonProps) => (
  <button
    onClick={() => navigateTo(action)}
    className={`flex w-1/3 flex-col items-center justify-center p-2 ${active ? "text-indigo-500" : "text-gray-400"} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
    disabled={disabled}
    title={tooltip || ""}
  >
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? "bg-indigo-500 text-white" : "bg-gray-200 text-gray-500"} ${disabled ? "" : "transition hover:scale-110 hover:bg-gray-300"}`}
    >
      <FontAwesomeIcon icon={icon} size="lg" />
    </div>
    {label ? '<span className="mt-1 text-xs">{label}</span>' : null}
  </button>
);

export default NavButton;
