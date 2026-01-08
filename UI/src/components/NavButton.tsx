"use client";

import { UnstyledButton, Stack, Text } from '@mantine/core';
import React from "react";
import type { Icon as TablerIcon } from '@tabler/icons-react';

import { navigateTo } from "@/lib/navigateTo";

export interface NavButtonProps {
  active: boolean;
  icon: TablerIcon;
  label: string;
  action: string;
  disabled?: boolean;
  tooltip?: string;
}

const NavButton = ({ active, icon: Icon, label, action, disabled, tooltip }: NavButtonProps) => {
  const activeColor = 'var(--mantine-color-secondary-5)'; // Secondary color (replaces indigo-500)
  const inactiveColor = 'var(--mantine-color-gray-4)'; // Gray (replaces gray-400)
  const activeBg = 'var(--mantine-color-secondary-5)';
  const inactiveBg = 'var(--mantine-color-gray-2)';

  return (
    <UnstyledButton
      onClick={() => navigateTo(action)}
      disabled={disabled}
      title={tooltip || ""}
      data-testid={`nav-button-${action}`}
      style={{
        width: '33.333%',
        padding: '0.5rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Stack gap="xs" align="center">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: active ? activeBg : inactiveBg,
            color: active ? 'white' : inactiveColor,
            transition: disabled ? 'none' : 'transform 0.2s, background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!disabled && !active) {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.backgroundColor = active ? activeBg : inactiveBg;
            }
          }}
        >
          <Icon size={20} />
        </div>
        {label && (
          <Text size="xs" c={active ? activeColor : inactiveColor}>
            {label}
          </Text>
        )}
      </Stack>
    </UnstyledButton>
  );
};

export default NavButton;
