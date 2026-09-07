import api from '@/services/api'

import type {
  PaginatedSalesResponse,
  Sale,
  SaleCreate,
  SalesParams,
} from '@/types/sale.types'

export const getSales = async ({
  year,
  month,
  page,
  limit,
  search,
  team,
  sort,
  order,
}: SalesParams): Promise<PaginatedSalesResponse> => {
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

  const { data } = await api.get<PaginatedSalesResponse>('/sales', {
    params,
  })

  return data
}

export const createSale = async (sale: SaleCreate): Promise<Sale> => {
  const { data } = await api.post<Sale>('/sales', sale)

  return data
}
