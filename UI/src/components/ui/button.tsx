import { Button as MantineButton, type ButtonProps as MantineButtonProps } from '@mantine/core';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg';

interface ButtonProps extends Omit<MantineButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

function Button({ variant = 'default', size = 'default', className, ...props }: ButtonProps) {
  // Map custom variants to Mantine variants
  const mantineVariant = (() => {
    switch (variant) {
      case 'default':
        return 'filled';
      case 'destructive':
        return 'filled';
      case 'outline':
        return 'outline';
      case 'secondary':
        return 'filled';
      case 'ghost':
        return 'subtle';
      case 'link':
        return 'transparent';
      default:
        return 'filled';
    }
  })();

  // Map custom sizes to Mantine sizes
  const mantineSize = (() => {
    switch (size) {
      case 'default':
        return 'md';
      case 'sm':
        return 'sm';
      case 'lg':
        return 'lg';
      default:
        return 'md';
    }
  })();

  // Determine color based on variant
  const color = (() => {
    switch (variant) {
      case 'destructive':
        return 'red';
      case 'secondary':
        return 'secondary';
      default:
        return undefined; // Use default primary color
    }
  })();

  // Add underline style for link variant
  const styles = variant === 'link' ? { root: { textDecoration: 'underline' } } : undefined;

  return (
    <MantineButton
      variant={mantineVariant}
      size={mantineSize}
      color={color}
      styles={styles}
      className={cn(className)}
      {...props}
    />
  );
}

export { Button };
