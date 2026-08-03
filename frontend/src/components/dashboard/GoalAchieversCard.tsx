import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface GoalAchieversCardProps {
  goalAchieversCount: number
  salespeopleCount: number
}

const GoalAchieversCard = ({
  goalAchieversCount,
  salespeopleCount,
}: GoalAchieversCardProps) => {
  const percentage =
    salespeopleCount > 0 ? (goalAchieversCount / salespeopleCount) * 100 : 0

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Goal Achievers</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold tracking-tight">
              {goalAchieversCount}
              <span className="ml-1 text-2xl font-medium text-muted-foreground">
                / {salespeopleCount}
                <span className="ml-2 text-sm">
                  salespeople reached their goal
                </span>
              </span>
            </p>
          </div>

          <span className="text-2xl font-semibold tabular-nums">
            {Math.round(percentage)}%
          </span>
        </div>

        <Progress value={percentage} />
      </CardContent>
    </Card>
  )
}

export default GoalAchieversCard
