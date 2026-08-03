import api from '@/services/api'

import type {
  PaginatedSalespeopleResponse,
  SalespeopleParams,
} from '@/types/salesperson.types'

export const getSalespeople = async ({
  page,
  limit,
  search,
  team,
  sort,
  order,
}: SalespeopleParams): Promise<PaginatedSalespeopleResponse> => {
  const params = Object.fromEntries(
    Object.entries({
      page,
      limit,
      search,
      team,
      sort,
      order,
    }).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  )

  const { data } = await api.get<PaginatedSalespeopleResponse>('/salespeople', {
    params,
  })

  return data
}
