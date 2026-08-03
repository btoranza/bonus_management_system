import api from './api'

import type { DashboardResponse } from '@/types/dashboard.types'
import type { Period } from '@/providers/PeriodProvider'

class DashboardService {
  async getDashboard(period: Period): Promise<DashboardResponse> {
    const { data } = await api.get<DashboardResponse>('/dashboard', {
      params: {
        year: period.year,
        month: period.month,
      },
    })

    return data
  }
}

export default new DashboardService()
