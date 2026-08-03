import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/currency'

import type { TeamBonus } from '@/types/dashboard.types'

interface TotalBonusByTeamCardProps {
  bonusByTeam: TeamBonus[]
}

const TotalBonusByTeamCard = ({ bonusByTeam }: TotalBonusByTeamCardProps) => {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Total Bonus</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-evenly">
        {bonusByTeam.map(({ team, total_bonus }) => (
          <div key={team} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-chart-1" />
              <span className="font-medium">{team}</span>
            </div>

            <span className="font-semibold tabular-nums">
              {total_bonus > 0 ? formatCurrency(total_bonus) : '-'}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default TotalBonusByTeamCard
