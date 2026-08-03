import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getSalespeople } from '@/services/salespeople.service'
import type { SalespeopleParams } from '@/types/salesperson.types'

export const useSalespeople = ({
  page,
  limit,
  search,
  team,
  sort,
  order,
}: SalespeopleParams) => {
  return useQuery({
    queryKey: ['salespeople', page, limit, search, team, sort, order],
    queryFn: () =>
      getSalespeople({
        page,
        limit,
        search,
        team,
        sort,
        order,
      }),
    placeholderData: keepPreviousData,
  })
}
