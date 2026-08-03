import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import type { TeamAchievement } from '@/types/dashboard.types'

interface GoalAchievementCardProps {
  goalAchievementByTeam: TeamAchievement[]
}

const GoalAchievementCard = ({
  goalAchievementByTeam,
}: GoalAchievementCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Achievement</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-evenly">
        {goalAchievementByTeam.map(({ team, achievement_pct }) => (
          <div key={team} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{team}</span>

              <span className="text-sm font-semibold">
                {Math.round(achievement_pct)}%
              </span>
            </div>

            <Progress value={Math.min(achievement_pct, 100)} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default GoalAchievementCard
