import type { ColumnDef } from '@tanstack/react-table'

import SortableHeader from '@/components/ui/sortable-header'
import { formatCurrency } from '@/lib/currency'
import type { Bonus, BonusesSort, SortOrder } from '@/types/bonus.types'

interface BonusesTableColumnsProps {
  sort: BonusesSort
  order: SortOrder
  onSortChange: (sort: BonusesSort, order: SortOrder) => void
}

export const getBonusesTableColumns = ({
  sort,
  order,
  onSortChange,
}: BonusesTableColumnsProps): ColumnDef<Bonus>[] => [
  {
    accessorKey: 'salesperson_name',
    header: () => (
      <SortableHeader
        label="Salesperson"
        field="salesperson_name"
        sort={sort}
        order={order}
        onSortChange={onSortChange}
      />
    ),
  },
  {
    accessorKey: 'team',
    header: 'Team',
  },
  {
    accessorKey: 'total_sold',
    header: () => (
      <SortableHeader
        label="Total Sold"
        field="total_sold"
        sort={sort}
        order={order}
        align="right"
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium tabular-nums">
        {formatCurrency(row.original.total_sold)}
      </div>
    ),
  },
  {
    accessorKey: 'base_bonus',
    header: () => <div className="text-right">Base Bonus</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {formatCurrency(row.original.base_bonus)}
      </div>
    ),
  },
  {
    accessorKey: 'new_customer_bonus',
    header: () => <div className="text-right">New Customer Bonus</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {formatCurrency(row.original.new_customer_bonus)}
      </div>
    ),
  },
  {
    accessorKey: 'total_bonus',
    header: () => (
      <SortableHeader
        label="Total Bonus"
        field="total_bonus"
        sort={sort}
        order={order}
        align="right"
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => (
      <div className="text-right font-semibold tabular-nums">
        {formatCurrency(row.original.total_bonus)}
      </div>
    ),
  },
]
