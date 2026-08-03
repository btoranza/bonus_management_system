import { Minus, TrendingDown, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'

type ChangeIndicatorVariant = 'icon' | 'arrow'

interface ChangeIndicatorProps {
  value: number
  decimals?: number
  variant?: ChangeIndicatorVariant
  className?: string
  iconClassName?: string
}

const ARROWS = { positive: '↑', negative: '↓', neutral: '–' }

const ChangeIndicator = ({
  value,
  decimals = 0,
  variant = 'icon',
  className,
  iconClassName,
}: ChangeIndicatorProps) => {
  const isPositive = value > 0
  const isNegative = value < 0
  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium',
        isPositive && 'text-success',
        isNegative && 'text-danger',
        !isPositive && !isNegative && 'text-muted-foreground',
        className,
      )}
    >
      {variant === 'icon' ? (
        <Icon className={cn('size-4', iconClassName)} />
      ) : (
        <span>
          {isPositive
            ? ARROWS.positive
            : isNegative
              ? ARROWS.negative
              : ARROWS.neutral}
        </span>
      )}
      {Math.abs(value).toFixed(decimals)}%
    </span>
  )
}

export default ChangeIndicator
