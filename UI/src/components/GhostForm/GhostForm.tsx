"use client";

import Form from "next/form";
import React, { useActionState } from "react";
import { Stack, Alert, Button } from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

import GhostFormField from "@/components/GhostForm/GhostFormField";

export type GhostFormResponse = {
  success: boolean;
  message: string;
  fields?: Record<string, FormDataEntryValue | null>;
  errors?: {
    [key: string]: string;
  };
};

export type GhostFormField = {
  type: "text" | "email" | "password" | "textarea" | "select" | "switch" | "date";
  name: string;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
  defaultValue?: string | number | boolean;
  disabled?: boolean;
  error?: string;
};

export type ActionType = (e: FormData) => Promise<GhostFormResponse>;

export interface IForm {
  action: (previousData: GhostFormResponse, form: FormData) => Promise<GhostFormResponse>;
  fields: Array<GhostFormField>;
  submitText?: string;
}

const defaultState: GhostFormResponse = {
  success: false,
  message: "",
  errors: [] as unknown as { [key: string]: string },
};

const GhostForm = ({ action, fields, submitText }: IForm) => {
  const [state, stateAction, isPending] = useActionState(action, defaultState);

  return (
    <Form action={stateAction}>
      <Stack gap="md" maw={420} w="100%" align="center">
        {fields.map((field) => (
          <GhostFormField
            key={field.name}
            {...field}
            defaultValue={(state.fields?.[field.name] as typeof field.defaultValue) ?? field.defaultValue}
          />
        ))}
        <Button type="submit" fullWidth disabled={isPending}>
          {submitText ?? "Submit"}
        </Button>

        {/* Loading state */}
        {isPending && (
          <Alert color="blue" title="Processing" icon={<IconAlertCircle />}>
            Logging in...
          </Alert>
        )}

        {/* Error state */}
        {!isPending && state.message && !state.success && (
          <Alert color="red" icon={<IconAlertCircle />} role="alert">
            {state.message}
          </Alert>
        )}

        {/* Success state */}
        {!isPending && state.message && state.success && (
          <Alert color="green" icon={<IconCheck />} role="alert">
            {state.message}
          </Alert>
        )}
      </Stack>
    </Form>
  );
};

export default GhostForm;
