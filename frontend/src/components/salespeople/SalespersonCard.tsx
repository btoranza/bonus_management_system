import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import TeamBadge from '@/components/ui/team-badge'
import { formatDate } from '@/lib/date'
import { cn } from '@/lib/utils'
import { getTeamColor } from '@/lib/team-colors'
import type { Salesperson } from '@/types/salesperson.types'

interface SalespersonCardProps {
  salesperson: Salesperson
}

const getInitials = (firstName: string, lastName: string) =>
  `${firstName[0] ?? ''}${lastName[0] ?? ''}`

const SalespersonCard = ({ salesperson }: SalespersonCardProps) => {
  const teamColor = getTeamColor(salesperson.team)

  return (
    <div
      className={cn(
        'rounded-2xl border border-l-4 bg-card p-4',
        teamColor.border,
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className={teamColor.badge}>
            {getInitials(salesperson.first_name, salesperson.last_name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {salesperson.first_name} {salesperson.last_name}
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {salesperson.email}
          </p>
        </div>

        <span
          className={cn(
            'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
            salesperson.active
              ? 'bg-success/15 text-success'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {salesperson.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-3 text-sm text-muted-foreground">
        <TeamBadge team={salesperson.team} />
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">{salesperson.salesperson_id}</span>
        <span aria-hidden="true">·</span>
        <span>Hired {formatDate(salesperson.hire_date)}</span>
      </div>
    </div>
  )
}

export default SalespersonCard
