import * as React from 'react';
import { cn } from '@/utils';
import { Button, type ButtonProps } from '@/components/ui/button';

type Props = ButtonProps;

const BrandButton = React.forwardRef<HTMLButtonElement, Props>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        asChild={asChild}
        variant={variant}
        size={size}
        className={cn(
          'border-0 bg-gradient-to-r from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-[var(--brand-foreground)] shadow-lg transition-transform hover:from-[var(--brand-gradient-from-hover)] hover:to-[var(--brand-gradient-to-hover)] hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60',
          className
        )}
        {...props}
      />
    );
  }
);
BrandButton.displayName = 'BrandButton';

export { BrandButton };

