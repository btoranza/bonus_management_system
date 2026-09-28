import TeamBadge from '@/components/ui/team-badge'
import { formatCurrency } from '@/lib/currency'
import { cn } from '@/lib/utils'
import { getTeamColor } from '@/lib/team-colors'
import type { Bonus } from '@/types/bonus.types'

interface BonusCardProps {
  bonus: Bonus
}

const BonusCard = ({ bonus }: BonusCardProps) => {
  const teamColor = getTeamColor(bonus.team)

  return (
    <div
      className={cn(
        'rounded-2xl border border-l-4 bg-card p-4',
        teamColor.border,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{bonus.salesperson_name}</p>
          <TeamBadge team={bonus.team} className="mt-1" />
        </div>

        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold tabular-nums">
            {formatCurrency(bonus.total_bonus)}
          </p>
          <p className="text-xs text-muted-foreground">Total Bonus</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Sold</p>
          <p className="font-medium tabular-nums">
            {formatCurrency(bonus.total_sold)}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">Base</p>
          <p className="font-medium tabular-nums">
            {formatCurrency(bonus.base_bonus)}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">New Cust.</p>
          <p className="font-medium tabular-nums">
            {formatCurrency(bonus.new_customer_bonus)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BonusCard
