import * as React from 'react';
import { cn } from '@/utils';
import { Card as UICard, type CardProps } from '@/components/ui/card';

type Props = CardProps;

const FrostedCard = React.forwardRef<HTMLDivElement, Props>(({ className, ...props }, ref) => {
  return (
    <UICard
      ref={ref}
      className={cn(
        // Frosted glass look with subtle gradients and depth
        'relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 text-card-foreground shadow-[0_22px_45px_-18px_rgba(15,23,42,0.85)] backdrop-blur-2xl backdrop-saturate-150 transition-shadow duration-300',
        'before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-white/25 before:via-white/10 before:to-transparent before:opacity-80 before:content-[""]',
        'after:pointer-events-none after:absolute after:-top-28 after:right-[-10%] after:h-72 after:w-72 after:-z-10 after:rounded-full after:bg-gradient-to-br after:from-sky-500/30 after:via-purple-500/10 after:to-emerald-400/25 after:opacity-40 after:blur-3xl after:transition-opacity after:duration-500 after:content-[""]',
        'hover:after:opacity-65 hover:shadow-[0_28px_60px_-22px_rgba(15,23,42,0.95)]',
        className
      )}
      {...props}
    />
  );
});

FrostedCard.displayName = 'FrostedCard';

export { FrostedCard };
