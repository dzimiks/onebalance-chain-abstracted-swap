import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-red-500/50 text-red-900 bg-red-50 dark:border-red-500/50 dark:text-red-100 dark:bg-red-950/50 [&>svg]:text-current',
        success:
          'border-green-500/50 text-green-900 bg-green-50 dark:border-green-500/50 dark:text-green-100 dark:bg-green-950/50 [&>svg]:text-current',
        warning:
          'border-yellow-500/50 text-yellow-900 bg-yellow-50 dark:border-yellow-500/50 dark:text-yellow-100 dark:bg-yellow-950/50 [&>svg]:text-current',
        info: 'border-blue-500/50 text-blue-900 bg-blue-50 dark:border-blue-500/50 dark:text-blue-100 dark:bg-blue-950/50 [&>svg]:text-current',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed opacity-90',
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
