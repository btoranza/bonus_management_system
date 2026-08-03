import type { ColumnDef } from '@tanstack/react-table'

import SortableHeader from '@/components/ui/sortable-header'
import { formatDate } from '@/lib/date'
import type {
  Salesperson,
  SalespeopleSort,
  SortOrder,
} from '@/types/salesperson.types'

interface SalespeopleTableColumnsProps {
  sort: SalespeopleSort
  order: SortOrder
  onSortChange: (sort: SalespeopleSort, order: SortOrder) => void
}

export const getSalespeopleTableColumns = ({
  sort,
  order,
  onSortChange,
}: SalespeopleTableColumnsProps): ColumnDef<Salesperson>[] => [
  {
    id: 'name',
    header: () => (
      <SortableHeader
        label="Name"
        field="first_name"
        sort={sort}
        order={order}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
  },
  {
    accessorKey: 'salesperson_id',
    header: 'ID',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'team',
    header: 'Team',
  },
  {
    accessorKey: 'hire_date',
    header: () => (
      <SortableHeader
        label="Hire Date"
        field="hire_date"
        sort={sort}
        order={order}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => formatDate(row.original.hire_date),
  },
  {
    accessorKey: 'active',
    header: 'Status',
    cell: ({ row }) => (
      <span
        className={
          row.original.active
            ? 'text-success font-medium'
            : 'text-muted-foreground'
        }
      >
        {row.original.active ? 'Active' : 'Inactive'}
      </span>
    ),
  },
]
