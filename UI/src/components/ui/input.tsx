import { TextInput, type TextInputProps, FileInput, type FileInputProps } from '@mantine/core';

interface InputProps extends Omit<TextInputProps, 'type'> {
  type?: string;
}

function Input({ type, ...props }: InputProps) {
  // Use FileInput for file type
  if (type === 'file') {
    return <FileInput {...(props as unknown as FileInputProps)} />;
  }

  // Use TextInput for all other types
  return <TextInput type={type} {...props} />;
}

export { Input };
