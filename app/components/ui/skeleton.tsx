import { cn } from '@/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[var(--surface-muted)] backdrop-blur-sm',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
