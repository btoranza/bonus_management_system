import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { createCustomer, getCustomers } from '@/services/customers.service'
import type { CustomersParams } from '@/types/customer.types'

export const useCustomers = ({
  page = 1,
  limit = 20,
  search,
}: CustomersParams = {}) => {
  return useQuery({
    queryKey: ['customers', page, limit, search],
    queryFn: () =>
      getCustomers({
        page,
        limit,
        search,
      }),
    placeholderData: keepPreviousData,
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
