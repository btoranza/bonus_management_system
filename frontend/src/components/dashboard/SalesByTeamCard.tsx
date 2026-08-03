import BarComparisonChart from '@/components/charts/BarComparisonChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import type { TeamSales } from '@/types/dashboard.types'

interface SalesByTeamCardProps {
  salesByTeam: TeamSales[]
}

const formatCompact = (value: number) => `€${Math.round(value / 1000)}k`

const SalesByTeamCard = ({ salesByTeam }: SalesByTeamCardProps) => {
  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle>Sales</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <BarComparisonChart
          data={salesByTeam.map((team) => ({
            team: team.team,
            sales: team.total_sales,
          }))}
          categoryKey="team"
          valueKey="sales"
          label="Sales"
          valueFormatter={formatCompact}
        />
      </CardContent>
    </Card>
  )
}

export default SalesByTeamCard
