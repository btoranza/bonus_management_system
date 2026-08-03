export type Team = 'Enterprise' | 'Mid-Market' | 'SMB'

export interface Bonus {
  salesperson_id: string
  salesperson_name: string
  team: Team
  total_sold: number
  base_bonus: number
  new_customer_bonus: number
  total_bonus: number
}

export type BonusesSort = 'salesperson_name' | 'total_sold' | 'total_bonus'

export type SortOrder = 'asc' | 'desc'

export interface PaginatedBonusesResponse {
  items: Bonus[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface BonusesParams {
  year: number
  month: number
  page: number
  limit: number
  search?: string
  team?: string
  sort?: BonusesSort
  order?: SortOrder
}
