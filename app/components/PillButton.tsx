import * as React from 'react';
import { cn } from '@/utils';
import { Button, type ButtonProps } from '@/components/ui/button';

type Props = ButtonProps;

const PillButton = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        asChild={asChild}
        variant={variant}
        size={size}
        className={cn(
          'rounded-full border border-[var(--secondary-border)] bg-[var(--secondary)] text-[var(--secondary-foreground)] backdrop-blur-md transition-transform duration-300 hover:border-[var(--border)] hover:bg-[var(--secondary-hover)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60',
          className
        )}
        {...props}
      />
    );
  }
);
PillButton.displayName = 'PillButton';

export { PillButton };

