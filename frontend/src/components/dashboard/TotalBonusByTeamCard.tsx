import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const teams = [
  { name: 'Enterprise', totalBonus: 24850 },
  { name: 'Mid-Market', totalBonus: 13420 },
  { name: 'SMB', totalBonus: 7860 },
]

const formatCurrency = (value: number) => `€ ${value.toLocaleString('en-US')}`

const TotalBonusByTeamCard = () => {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Total Bonus by Team</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-evenly">
        {teams.map((team) => (
          <div key={team.name} className="flex items-center justify-between">
            <span className="font-medium">{team.name}</span>

            <span className="font-semibold tabular-nums">
              {formatCurrency(team.totalBonus)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default TotalBonusByTeamCard
