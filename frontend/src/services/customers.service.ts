import api from '@/services/api'

import type {
  CustomersParams,
  PaginatedCustomersResponse,
} from '@/types/customer.types'

export const getCustomers = async ({
  page,
  limit,
  search,
}: CustomersParams): Promise<PaginatedCustomersResponse> => {
  const params = Object.fromEntries(
    Object.entries({
      page,
      limit,
      search,
    }).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  )

  const { data } = await api.get<PaginatedCustomersResponse>('/customers', {
    params,
  })

  return data
}
