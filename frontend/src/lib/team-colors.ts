interface TeamColor {
  badge: string
  border: string
}

const DEFAULT_COLOR: TeamColor = {
  badge: 'bg-muted text-muted-foreground',
  border: 'border-l-border',
}

const TEAM_COLORS: Record<string, TeamColor> = {
  Enterprise: {
    badge: 'bg-primary/15 text-primary',
    border: 'border-l-primary',
  },
  'Mid-Market': {
    badge: 'bg-chart-2/15 text-chart-2',
    border: 'border-l-chart-2',
  },
  SMB: {
    badge: 'bg-warning/20 text-warning',
    border: 'border-l-warning',
  },
}

export const getTeamColor = (team: string): TeamColor =>
  TEAM_COLORS[team] ?? DEFAULT_COLOR
