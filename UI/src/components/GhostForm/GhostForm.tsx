"use client";

import Form from "next/form";
import React, { useActionState } from "react";

import GhostFormField from "@/components/GhostForm/GhostFormField";
import { Button } from "@/components/ui/button";

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
    <Form action={stateAction} className="my-4 flex w-full max-w-sm flex-col items-center justify-center gap-4">
      {fields.map((field) => (
        <GhostFormField
          key={field.name}
          {...field}
          defaultValue={(state.fields?.[field.name] as typeof field.defaultValue) ?? field.defaultValue}
        />
      ))}
      <Button type="submit" className="w-full" disabled={isPending}>
        {submitText ?? "Submit"}
      </Button>
      {isPending ? (
        <div className="rounded border border-blue-400 bg-blue-50 p-2 text-blue-700">Logging in . . . .</div>
      ) : state.message && !state.success ? (
        <div className="rounded border border-red-500 bg-red-100 p-2 text-red-700">{state.message}</div>
      ) : state.message && state.success ? (
        <div className="rounded border border-green-500 bg-green-100 p-2 text-green-700">{state.message}</div>
      ) : (
        <div className="invisible rounded p-2 text-gray-700">&nbsp;</div>
      )}
    </Form>
  );
};

export default GhostForm;
