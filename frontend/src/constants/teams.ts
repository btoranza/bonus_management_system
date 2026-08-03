import type { Team } from '@/types/salesperson.types'

export const TEAM_OPTIONS: { label: string; value: Team | 'all' }[] = [
  { label: 'All teams', value: 'all' },
  { label: 'Enterprise', value: 'Enterprise' },
  { label: 'Mid-Market', value: 'Mid-Market' },
  { label: 'SMB', value: 'SMB' },
]
