import type { GhostFormField as FormField } from "@/components/GhostForm/GhostForm";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


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
        <div className="w-full space-y-2">
          {label ? <Label htmlFor={name}>{label}</Label> : null}
          <Input
            id={name}
            type={type}
            name={name}
            placeholder={placeholder}
            autoComplete={autoComplete}
            defaultValue={(defaultValue as string) || ""}
            required={required}
            disabled={disabled}
            aria-invalid={!!error}
            title={error}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case "textarea":
      return (
        <div className="w-full space-y-2">
          <Label htmlFor={name}>{label}</Label>
          <textarea
            id={name}
            name={name}
            placeholder={placeholder}
            defaultValue={(defaultValue as string) || ""}
            required={required}
            disabled={disabled}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case "select":
      return (
        <div className="w-full space-y-2">
          <Label htmlFor={name}>{label}</Label>
          <select
            id={name}
            name={name}
            defaultValue={(defaultValue as string) || ""}
            required={required}
            disabled={disabled}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    case "switch":
      return (
        <div className="flex items-center space-x-2">
          <input
            id={name}
            type="checkbox"
            name={name}
            defaultChecked={defaultValue as boolean}
            required={required}
            disabled={disabled}
            className="border-input h-4 w-4 rounded disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Label htmlFor={name}>{label}</Label>
        </div>
      );

    case "date":
      return (
        <div className="w-full space-y-2">
          <Label htmlFor={name}>{label}</Label>
          <Input
            id={name}
            type="date"
            name={name}
            defaultValue={(defaultValue as string) || ""}
            required={required}
            disabled={disabled}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      );

    default:
      return null;
  }
};

export default GhostFormField;
