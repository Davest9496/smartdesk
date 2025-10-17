import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          // Variants
          variant === 'default' && 'bg-slate-900 text-white hover:bg-slate-800',
          variant === 'outline' &&
            'border border-slate-300 bg-white hover:bg-slate-50 text-slate-900',
          variant === 'ghost' && 'hover:bg-slate-100 text-slate-900',
          variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700',
          // Sizes
          size === 'default' && 'h-10 px-4 py-2 text-sm',
          size === 'sm' && 'h-8 px-3 text-xs',
          size === 'lg' && 'h-12 px-6 text-base',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
