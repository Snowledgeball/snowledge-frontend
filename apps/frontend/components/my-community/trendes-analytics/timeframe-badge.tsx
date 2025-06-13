import { Badge } from '@repo/ui';
import { Clock } from 'lucide-react';
import React from 'react';

// ============
// Function: TimeframeBadge
// ------------
// DESCRIPTION: Displays a harmonized badge for timeframe, with Clock icon. Supports string label (e.g. 'last week') or custom date range ({ from, to }).
// PARAMS:
//   - timeframe: string | { from: Date, to: Date } (time range label or custom dates)
//   - className?: string (optional extra classes)
// RETURNS: JSX.Element (badge)
// ============
export type TimeframeBadgeProps = {
  timeframe: string | { from: Date, to: Date }
  className?: string
}

export function TimeframeBadge({ timeframe, className = '' }: TimeframeBadgeProps) {
  let label = ''
  if (typeof timeframe === 'string') {
    label = timeframe
  } else if (timeframe && timeframe.from && timeframe.to) {
    const fromStr = timeframe.from.toLocaleDateString('en-CA')
    const toStr = timeframe.to.toLocaleDateString('en-CA')
    label = `${fromStr} to ${toStr}`
  }
  return (
    <Badge
      variant="outline"
      className={`text-xs flex items-center gap-1 ${className}`}
      aria-label={`Timeframe: ${label}`}
      role="status"
    >
      <Clock size={12} /> {label}
    </Badge>
  )
} 