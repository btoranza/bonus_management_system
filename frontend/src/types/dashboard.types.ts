export type Team = 'Enterprise' | 'SMB' | 'Mid-Market'

export interface TopSalesperson {
  salesperson_id: string
  name: string
  team: Team
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
  new_customers_count: number
  new_customers_change_pct: number | null
  average_sale: number
  average_sale_change_pct: number | null
  goal_achievers_count: number
  sales_by_team: TeamSales[]
  bonus_by_team: TeamBonus[]
  goal_achievement_by_team: TeamAchievement[]
  top_salespeople: TopSalesperson[]
  sales_trend: TrendPoint[]
}
