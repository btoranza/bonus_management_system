import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getSales } from '@/services/sales.service'
import type { SalesParams } from '@/types/sale.types'

export const useSales = ({
  year,
  month,
  page,
  limit,
  search,
  team,
  sort,
  order,
}: SalesParams) => {
  return useQuery({
    queryKey: ['sales', year, month, page, limit, search, team, sort, order],
    queryFn: () =>
      getSales({
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
