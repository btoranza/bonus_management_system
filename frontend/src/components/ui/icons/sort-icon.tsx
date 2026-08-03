import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import type { SortOrder } from '@/types/sale.types'

interface SortIconProps {
  active: boolean
  order: SortOrder
}

const SortIcon = ({ active, order }: SortIconProps) => {
  if (!active) {
    return <ArrowUpDown className="ml-2 size-4" />
  }

  return order === 'asc' ? (
    <ArrowUp className="ml-2 size-4" />
  ) : (
    <ArrowDown className="ml-2 size-4" />
  )
}

export default SortIcon
