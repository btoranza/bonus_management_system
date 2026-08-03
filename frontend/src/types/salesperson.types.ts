export type Team = 'Enterprise' | 'Mid-Market' | 'SMB'

export interface Salesperson {
  salesperson_id: string
  first_name: string
  last_name: string
  email: string
  team: Team
  hire_date: string
  active: boolean
}

export type SalespeopleSort = 'first_name' | 'hire_date'
export type SortOrder = 'asc' | 'desc'

export interface PaginatedSalespeopleResponse {
  items: Salesperson[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface SalespeopleParams {
  page: number
  limit: number
  search?: string
  team?: string
  sort?: SalespeopleSort
  order?: SortOrder
}
