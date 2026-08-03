import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/currency'
import ChangeIndicator from '@/components/ui/change-indicator'

interface KpiCardsProps {
  totalSales: number
  totalSalesChangePct: number | null
  totalBonus: number
  totalBonusChangePct: number | null
  salesCount: number
  salesCountChangePct: number | null
  salespeopleCount: number
}

const KpiCards = ({
  totalSales,
  totalSalesChangePct,
  totalBonus,
  totalBonusChangePct,
  salesCount,
  salesCountChangePct,
  salespeopleCount,
}: KpiCardsProps) => {
  const kpis = [
    {
      title: 'Total Sales',
      value: formatCurrency(totalSales),
      change: totalSalesChangePct,
    },
    {
      title: 'Total Bonus',
      value: formatCurrency(totalBonus),
      change: totalBonusChangePct,
    },
    {
      title: 'Sales',
      value: salesCount.toLocaleString(),
      change: salesCountChangePct,
    },
    {
      title: 'Salespeople',
      value: salespeopleCount.toString(),
      change: null,
    },
  ]

  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title} className="gap-3">
          <CardHeader>
            <CardTitle>{kpi.title}</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold tracking-tight">{kpi.value}</p>

            {kpi.change !== null && (
              <p className="mt-2 flex items-center gap-1.5 text-sm">
                <ChangeIndicator value={kpi.change} decimals={1} />
                <span className="font-normal text-muted-foreground">
                  vs last month
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  )
}

export default KpiCards
