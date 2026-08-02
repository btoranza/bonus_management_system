import { useMemo } from 'react'

import AreaTrendChart from '@/components/charts/AreaTrendChart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { usePeriod } from '@/providers/PeriodProvider'

const TREND_MONTHS = 6

const formatCompact = (value: number) => `€${Math.round(value / 1000)}k`

// deterministic mock so the same period always renders the same figures
const mockSalesFor = (year: number, month: number) => {
  const seed = Math.sin(year * 12 + month) * 43758.5453
  const fraction = seed - Math.floor(seed)
  return Math.round(25000 + fraction * 30000)
}

const buildTrendData = (year: number, month: number) =>
  Array.from({ length: TREND_MONTHS }, (_, i) => {
    const date = new Date(year, month - 1 - (TREND_MONTHS - 1 - i), 1)
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      sales: mockSalesFor(date.getFullYear(), date.getMonth() + 1),
    }
  })

const SalesTrendCard = () => {
  const { period } = usePeriod()
  const data = useMemo(
    () => buildTrendData(period.year, period.month),
    [period.year, period.month],
  )

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle>Sales Trend</CardTitle>
        <CardDescription>Last 6 months</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <AreaTrendChart
          data={data}
          categoryKey="month"
          valueKey="sales"
          label="Sales"
          valueFormatter={formatCompact}
        />
      </CardContent>
    </Card>
  )
}

export default SalesTrendCard
