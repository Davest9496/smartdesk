import * as React from 'react'
import { cn } from '@/lib/utils'

export type BadgeProps = React.HTMLAttributes<HTMLDivElement>

/**
 * Badge component for status indicators
 *
 * Why this component:
 * - Consistent styling across app
 * - Accessible
 * - Easy to extend with variants
 */
function Badge({ className, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
        className
      )}
      {...props}
    />
  )
}

export { Badge }
