import { formatCurrency } from '@/lib/currency'
import { formatDate } from '@/lib/date'
import type { Sale } from '@/types/sale.types'

interface SaleCardProps {
  sale: Sale
}

const SaleCard = ({ sale }: SaleCardProps) => {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{sale.customer_name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {sale.salesperson_name} · {sale.team}
          </p>
        </div>

        <p className="shrink-0 font-semibold tabular-nums">
          {formatCurrency(sale.amount)}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
        <span>{formatDate(sale.date)}</span>
        <span className="tabular-nums">{sale.invoice_number}</span>
      </div>
    </div>
  )
}

export default SaleCard
