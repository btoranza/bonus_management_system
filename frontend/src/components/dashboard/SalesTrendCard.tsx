import AreaTrendChart from '@/components/charts/AreaTrendChart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import type { TrendPoint } from '@/types/dashboard.types'

interface SalesTrendCardProps {
  salesTrend: TrendPoint[]
}

const formatCompact = (value: number) => `€${Math.round(value / 1000)}k`

const SalesTrendCard = ({ salesTrend }: SalesTrendCardProps) => {
  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle>Sales Trend</CardTitle>
        <CardDescription>Last 6 months</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <AreaTrendChart
          data={salesTrend.map((point) => ({
            month: point.period,
            sales: point.total_sales,
          }))}
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
