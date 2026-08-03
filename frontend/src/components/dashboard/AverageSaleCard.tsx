import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ChangeIndicator from '@/components/ui/change-indicator'
import { formatCurrency } from '@/lib/currency'
import type { TeamAverageSale } from '@/types/dashboard.types'

interface AverageSaleCardProps {
  averageSaleByTeam: TeamAverageSale[]
}
const AverageSaleCard = ({ averageSaleByTeam }: AverageSaleCardProps) => {
  return (
    <Card className="lg:h-full">
      <CardHeader>
        <CardTitle>Average Sale</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-3 gap-4">
        {averageSaleByTeam.map(
          ({ team, average_sale, sales_count, average_sale_change_pct }) => {
            const hasSales = sales_count > 0

            return (
              <div key={team} className="text-center">
                <p className="text-sm font-medium">{team}</p>

                <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">
                  {hasSales ? formatCurrency(average_sale) : '-'}
                </p>

                <p className="mt-1 text-xs">
                  {hasSales ? (
                    <>
                      <ChangeIndicator
                        value={average_sale_change_pct ?? 0}
                        variant="arrow"
                        className="text-xs"
                      />

                      <span className="text-muted-foreground">
                        {' '}
                        • {sales_count} {sales_count === 1 ? 'sale' : 'sales'}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">No sales</span>
                  )}
                </p>
              </div>
            )
          },
        )}
      </CardContent>
    </Card>
  )
}

export default AverageSaleCard
