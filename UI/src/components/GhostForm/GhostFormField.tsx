import { TextInput, Textarea, Select, Switch } from '@mantine/core';
import { DateInput } from '@mantine/dates';

import type { GhostFormField as FormField } from "@/components/GhostForm/GhostForm";

const GhostFormField = ({
  type,
  name,
  label,
  placeholder,
  options,
  required,
  defaultValue,
  disabled,
  autoComplete,
  error,
}: FormField) => {
  switch (type) {
    case "text":
    case "email":
    case "password":
      return (
        <TextInput
          type={type}
          name={name}
          label={label}
          placeholder={placeholder}
          autoComplete={autoComplete}
          defaultValue={(defaultValue as string) || ""}
          required={required}
          disabled={disabled}
          error={error}
          w="100%"
        />
      );

    case "textarea":
      return (
        <Textarea
          name={name}
          label={label}
          placeholder={placeholder}
          defaultValue={(defaultValue as string) || ""}
          required={required}
          disabled={disabled}
          error={error}
          minRows={3}
          w="100%"
        />
      );

    case "select":
      return (
        <Select
          name={name}
          label={label}
          data={options?.map(opt => ({ value: opt.value, label: opt.label })) || []}
          defaultValue={(defaultValue as string) || ""}
          required={required}
          disabled={disabled}
          error={error}
          w="100%"
        />
      );

    case "switch":
      return (
        <Switch
          name={name}
          label={label}
          defaultChecked={defaultValue as boolean}
          required={required}
          disabled={disabled}
        />
      );

    case "date":
      return (
        <DateInput
          name={name}
          label={label}
          defaultValue={defaultValue ? new Date(defaultValue as string) : undefined}
          required={required}
          disabled={disabled}
          error={error}
          w="100%"
        />
      );

    default:
      return null;
  }
};

export default GhostFormField;
