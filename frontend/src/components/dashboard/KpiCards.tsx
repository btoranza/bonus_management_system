import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const kpis = [
  { title: 'Total Sales', value: '€ 425,000', change: 12.5 },
  { title: 'Total Bonus', value: '€ 45,000', change: 8.2 },
  { title: 'Sales', value: '124', change: -3.4 },
  { title: 'Salespeople', value: '20', change: 0 },
]

const KpiCards = () => {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const isPositive = kpi.change >= 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown

        return (
          <Card key={kpi.title} className="gap-3">
            <CardHeader>
              <CardTitle>{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold tracking-tight">{kpi.value}</p>
              <p
                className={cn(
                  'mt-2 flex items-center gap-1.5 text-sm font-medium',
                  isPositive ? 'text-success' : 'text-danger',
                )}
              >
                <TrendIcon className="size-4" />
                {isPositive ? '+' : ''}
                {kpi.change}%
                <span className="text-muted-foreground font-normal">
                  vs last month
                </span>
              </p>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}

export default KpiCards
