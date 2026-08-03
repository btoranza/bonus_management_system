import { Button } from '@/components/ui/button'
import SortIcon from './icons/sort-icon'

interface SortableHeaderProps<T extends string> {
  label: string
  field: T
  sort: T
  order: 'asc' | 'desc'
  align?: 'left' | 'right'
  onSortChange: (sort: T, order: 'asc' | 'desc') => void
}

const SortableHeader = <T extends string>({
  label,
  field,
  sort,
  order,
  align = 'left',
  onSortChange,
}: SortableHeaderProps<T>) => {
  return (
    <div className={align === 'right' ? 'flex justify-end' : undefined}>
      <Button
        variant="ghost"
        className={align === 'right' ? '-mr-3' : '-ml-3'}
        onClick={() =>
          onSortChange(
            field,
            sort === field && order === 'asc' ? 'desc' : 'asc',
          )
        }
      >
        {label}
        <SortIcon active={sort === field} order={order} />
      </Button>
    </div>
  )
}

export default SortableHeader
