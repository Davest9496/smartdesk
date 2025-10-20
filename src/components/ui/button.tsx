import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg'
}

/**
 * Button component with multiple variants and sizes
 *
 * Variants:
 * - default: Primary action (dark slate background)
 * - outline: Secondary action (border only)
 * - ghost: Tertiary action (no border, transparent)
 * - destructive: Dangerous action (red, for delete/cancel operations)
 *
 * Sizes:
 * - default: Standard button (h-10, text-sm)
 * - sm: Small button (h-8, text-xs)
 * - lg: Large button (h-12, text-base)
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-slate-900 text-white hover:bg-slate-800': variant === 'default',
            'border border-slate-300 bg-white text-slate-900 hover:bg-slate-100':
              variant === 'outline',
            'text-slate-900 hover:bg-slate-100': variant === 'ghost',
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600':
              variant === 'destructive',
          },
          {
            'h-10 px-4 py-2 text-sm': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-12 px-6 text-base': size === 'lg',
          },
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
