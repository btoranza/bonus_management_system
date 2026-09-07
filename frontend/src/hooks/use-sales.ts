import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { createSale, getSales } from '@/services/sales.service'
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

export const useCreateSale = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['bonuses'] })
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
