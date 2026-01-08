"use client"

import { Text, type TextProps } from '@mantine/core';

function Label({ children, ...props }: TextProps) {
  return (
    <Text
      component="label"
      size="sm"
      fw={500}
      {...props}
    >
      {children}
    </Text>
  );
}

export { Label };
