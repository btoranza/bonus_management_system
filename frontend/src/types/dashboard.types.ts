// Team names are open-ended and driven by the backend, not a fixed set.
export type Team = 'Enterprise' | 'Mid-Market' | 'SMB'

export interface TopPerformer {
  salesperson_id: string
  name: string
  team: Team
  goal_achievement_pct: number
  total_sales: number
  bonus: number
}

export interface TeamSales {
  team: Team
  total_sales: number
}

export interface TeamBonus {
  team: Team
  total_bonus: number
}

export interface TeamAchievement {
  team: Team
  achievement_pct: number
}

export interface TeamAverageSale {
  team: Team
  average_sale: number
  sales_count: number
  average_sale_change_pct: number | null
}

export interface TeamNewCustomers {
  team: Team
  new_customers_count: number
  new_customers_change_pct: number | null
}

export interface TrendPoint {
  period: string
  total_sales: number
}

export interface DashboardParams {
  year: number
  month: number
}

export interface DashboardResponse {
  period: string
  total_sales: number
  total_sales_change_pct: number | null
  total_bonus: number
  total_bonus_change_pct: number | null
  sales_count: number
  sales_count_change_pct: number | null
  salespeople_count: number
  new_customers_by_team: TeamNewCustomers[]
  average_sale_by_team: TeamAverageSale[]
  goal_achievers_count: number
  sales_by_team: TeamSales[]
  bonus_by_team: TeamBonus[]
  goal_achievement_by_team: TeamAchievement[]
  top_performers: TopPerformer[]
  sales_trend: TrendPoint[]
}
