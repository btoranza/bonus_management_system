import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getBonuses } from '@/services/bonus.service'
import type { BonusesParams } from '@/types/bonus.types'

export const useBonuses = ({
  year,
  month,
  page,
  limit,
  search,
  team,
  sort,
  order,
}: BonusesParams) => {
  return useQuery({
    queryKey: ['bonuses', year, month, page, limit, search, team, sort, order],
    queryFn: () =>
      getBonuses({
        year,
        month,
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
