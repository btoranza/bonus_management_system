export type CustomerStatus = 'new' | 'existing'

export interface Sale {
  sale_id: string
  salesperson_id: string
  salesperson_name: string
  invoice_number: string
  customer_id: string
  customer_name: string
  customer_status: CustomerStatus
  amount: number
  team: string
  date: string
  created_at: string
  updated_at: string
}

export type SalesSort = 'date' | 'amount'
export type SortOrder = 'asc' | 'desc'

export interface SalesParams {
  year: number
  month: number
  page: number
  limit: number
  search?: string
  team?: string
  sort?: SalesSort
  order?: SortOrder
}

export interface PaginatedSalesResponse {
  items: Sale[]
  total: number
  page: number
  limit: number
  total_pages: number
}
