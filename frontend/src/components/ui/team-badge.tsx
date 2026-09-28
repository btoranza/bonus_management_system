import { cn } from '@/lib/utils'
import { getTeamColor } from '@/lib/team-colors'

interface TeamBadgeProps {
  team: string
  className?: string
}

const TeamBadge = ({ team, className }: TeamBadgeProps) => {
  const teamColor = getTeamColor(team)

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium',
        teamColor.badge,
        className,
      )}
    >
      {team}
    </span>
  )
}

export default TeamBadge
