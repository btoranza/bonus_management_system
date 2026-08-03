import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
}

const Spinner = ({ className }: SpinnerProps) => {
  return (
    <Loader2
      className={cn('text-muted-foreground size-8 animate-spin', className)}
    />
  )
}

export default Spinner
