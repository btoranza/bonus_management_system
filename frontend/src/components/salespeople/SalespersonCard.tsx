import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDate } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { Salesperson } from '@/types/salesperson.types'

interface SalespersonCardProps {
  salesperson: Salesperson
}

const getInitials = (firstName: string, lastName: string) =>
  `${firstName[0] ?? ''}${lastName[0] ?? ''}`

const SalespersonCard = ({ salesperson }: SalespersonCardProps) => {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-muted text-muted-foreground">
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

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3 text-sm text-muted-foreground">
        <span>{salesperson.team}</span>
        <span aria-hidden="true">·</span>
        <span className="tabular-nums">{salesperson.salesperson_id}</span>
        <span aria-hidden="true">·</span>
        <span>Hired {formatDate(salesperson.hire_date)}</span>
      </div>
    </div>
  )
}

export default SalespersonCard
