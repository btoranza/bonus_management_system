export interface Customer {
  customer_id: string
  customer_name: string
}

export interface PaginatedCustomersResponse {
  items: Customer[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface CustomersParams {
  page?: number
  limit?: number
  search?: string
}
