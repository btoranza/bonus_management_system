import type { ColumnDef } from '@tanstack/react-table'

import SortableHeader from '@/components/ui/sortable-header'
import { formatCurrency } from '@/lib/currency'
import { formatDate } from '@/lib/date'
import type { Sale, SalesSort, SortOrder } from '@/types/sale.types'

interface SalesTableColumnsProps {
  sort: SalesSort
  order: SortOrder
  onSortChange: (sort: SalesSort, order: SortOrder) => void
}

export const getSalesTableColumns = ({
  sort,
  order,
  onSortChange,
}: SalesTableColumnsProps): ColumnDef<Sale>[] => [
  {
    accessorKey: 'date',
    header: () => (
      <SortableHeader
        label="Date"
        field="date"
        sort={sort}
        order={order}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: 'invoice_number',
    header: 'Invoice',
  },
  {
    accessorKey: 'customer_name',
    header: 'Customer',
  },
  {
    accessorKey: 'salesperson_name',
    header: 'Salesperson',
  },
  {
    accessorKey: 'team',
    header: 'Team',
  },
  {
    accessorKey: 'amount',
    header: () => (
      <SortableHeader
        label="Amount"
        field="amount"
        sort={sort}
        order={order}
        align="right"
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium tabular-nums">
        {formatCurrency(row.original.amount)}
      </div>
    ),
  },
]
