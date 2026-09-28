import TeamBadge from '@/components/ui/team-badge'
import { formatCurrency } from '@/lib/currency'
import { formatDate } from '@/lib/date'
import { cn } from '@/lib/utils'
import { getTeamColor } from '@/lib/team-colors'
import type { Sale } from '@/types/sale.types'

interface SaleCardProps {
  sale: Sale
}

const SaleCard = ({ sale }: SaleCardProps) => {
  const teamColor = getTeamColor(sale.team)

  return (
    <div
      className={cn(
        'rounded-2xl border border-l-4 bg-card p-4',
        teamColor.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{sale.customer_name}</p>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="truncate">{sale.salesperson_name}</span>
            <TeamBadge team={sale.team} />
          </div>
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
