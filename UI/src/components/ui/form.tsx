"use client";

import { Stack, type StackProps, Text, type TextProps } from '@mantine/core';
import * as React from "react";

// Temporary compatibility wrappers - will be replaced by @mantine/form in Phase 3

function FormItem({ children, ...props }: StackProps) {
  return (
    <Stack gap="xs" {...props}>
      {children}
    </Stack>
  );
}

function FormLabel({ children, ...props }: TextProps) {
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

function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function FormDescription({ children, ...props }: TextProps) {
  return (
    <Text size="sm" c="dimmed" {...props}>
      {children}
    </Text>
  );
}

function FormMessage({ children, ...props }: TextProps) {
  if (!children) return null;

  return (
    <Text size="sm" c="red" {...props}>
      {children}
    </Text>
  );
}

export { FormItem, FormLabel, FormControl, FormDescription, FormMessage };
