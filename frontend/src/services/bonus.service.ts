import api from '@/services/api'

import type {
  BonusesParams,
  PaginatedBonusesResponse,
} from '@/types/bonus.types'

export const getBonuses = async ({
  year,
  month,
  page,
  limit,
  search,
  team,
  sort,
  order,
}: BonusesParams): Promise<PaginatedBonusesResponse> => {
  const params = Object.fromEntries(
    Object.entries({
      year,
      month,
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

  const { data } = await api.get<PaginatedBonusesResponse>('/bonuses', {
    params,
  })

  return data
}
