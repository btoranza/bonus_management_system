import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const teamAchievements = [
  { team: 'Enterprise', achievement: 96 },
  { team: 'SMB', achievement: 84 },
  { team: 'Mid-Market', achievement: 78 },
]

const GoalAchievementCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Achievement</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-evenly">
        {teamAchievements.map(({ team, achievement }) => (
          <div key={team} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{team}</span>

              <span className="text-sm font-semibold">{achievement}%</span>
            </div>

            <Progress value={achievement} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default GoalAchievementCard
