import { useMemo } from 'react'

import BarComparisonChart from '@/components/charts/BarComparisonChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { usePeriod } from '@/providers/PeriodProvider'

const teams = ['Enterprise', 'Mid-Market', 'SMB']

const formatCompact = (value: number) => `€${Math.round(value / 1000)}k`

// deterministic mock so the same period always renders the same figures
const mockSalesFor = (year: number, month: number, teamIndex: number) => {
  const seed = Math.sin(year * 12 + month + teamIndex * 17) * 43758.5453
  const fraction = seed - Math.floor(seed)
  return Math.round(15000 + fraction * 35000)
}

const buildTeamData = (year: number, month: number) =>
  teams.map((team, index) => ({
    team,
    sales: mockSalesFor(year, month, index),
  }))

const SalesByTeamCard = () => {
  const { period } = usePeriod()
  const data = useMemo(
    () => buildTeamData(period.year, period.month),
    [period.year, period.month],
  )

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle>Sales by Team</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <BarComparisonChart
          data={data}
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
