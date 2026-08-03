import { useQuery } from '@tanstack/react-query'

import type { Period } from '@/providers/PeriodProvider'
import dashboardService from '@/services/dashboard.service'

const useDashboard = (period: Period) => {
  return useQuery({
    queryKey: ['dashboard', period.year, period.month],
    queryFn: () => dashboardService.getDashboard(period),
  })
}

export default useDashboard
