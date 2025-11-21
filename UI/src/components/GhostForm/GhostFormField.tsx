import React from "react";

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
        <>
          {label ? <label className="m-1 text-sm">{label}</label> : null}
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            autoComplete={autoComplete}
            defaultValue={(defaultValue as string) || ""}
            required={required}
            disabled={disabled}
            className={`m-0 w-full rounded border p-2 ${error ? "border-red-500" : "border-gray-300"}`}
            title={error}
          />
        </>
      );

    case "textarea":
      return (
        <>
          <label>{label}</label>
          <textarea
            name={name}
            placeholder={placeholder}
            defaultValue={(defaultValue as string) || ""}
            required={required}
            disabled={disabled}
            className="w-full rounded border p-2"
          />
        </>
      );

    case "select":
      return (
        <>
          <label>{label}</label>
          <select
            name={name}
            defaultValue={(defaultValue as string) || ""}
            required={required}
            disabled={disabled}
            className="w-full rounded border p-2"
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      );

    case "switch":
      return (
        <>
          <label>{label}</label>
          <input
            type="checkbox"
            name={name}
            defaultChecked={defaultValue as boolean}
            required={required}
            disabled={disabled}
          />
        </>
      );

    case "date":
      return (
        <>
          <label>{label}</label>
          <input
            type="date"
            name={name}
            defaultValue={(defaultValue as string) || ""}
            required={required}
            disabled={disabled}
            className="w-full rounded border p-2"
          />
        </>
      );

    default:
      return null;
  }
};

export default GhostFormField;
