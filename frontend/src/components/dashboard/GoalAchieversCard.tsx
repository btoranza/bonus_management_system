import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const GoalAchieversCard = () => {
  const achievers = 14
  const total = 20
  const percentage = (achievers / total) * 100

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Goal Achievers</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-bold tracking-tight">
              {achievers}
              <span className="ml-1 text-2xl font-medium text-muted-foreground">
                / {total}
                <span className="text-sm ml-2">
                  salespeople reached their goal
                </span>
              </span>
            </p>

            <p className="text-sm text-muted-foreground"></p>
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
