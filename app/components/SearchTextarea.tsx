import * as React from 'react';
import { cn } from '@/utils';
import { Textarea as UITextarea, type TextareaProps } from '@/components/ui/textarea';

const SearchTextarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <UITextarea
        ref={ref}
        className={cn(
          // Large, prominent search field styling
          'h-32 resize-none rounded-2xl px-6 py-4 text-lg transition-all duration-300',
          // Filled look consistent with prior design
          'bg-input backdrop-blur-lg',
          className
        )}
        {...props}
      />
    );
  }
);

SearchTextarea.displayName = 'SearchTextarea';

export { SearchTextarea };

