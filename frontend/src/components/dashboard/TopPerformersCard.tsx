import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import type { TopPerformer } from '@/types/dashboard.types'
import { Trophy } from 'lucide-react'

interface TopPerformersCardProps {
  topPerformers: TopPerformer[]
}

const avatarStyles: Record<number, string> = {
  1: 'bg-yellow-500/15 text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-300',
  2: 'bg-slate-500/15 text-slate-700 dark:bg-slate-300/15 dark:text-slate-300',
  3: 'bg-orange-500/15 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300',
}

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)

const TopPerformersCard = ({ topPerformers }: TopPerformersCardProps) => {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Top Performers</CardTitle>
        <CardDescription>Ranked by goal achievement</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-3 overflow-y-auto">
        {topPerformers.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Trophy className="mb-4 h-10 w-10 text-muted-foreground" />

            <p className="font-medium">No top performers yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Top performers will appear once sales are registered.
            </p>
          </div>
        ) : (
          topPerformers.map((person, index) => (
            <div
              key={person.salesperson_id}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="w-4 text-sm font-semibold text-muted-foreground">
                  {index + 1}
                </span>

                <Avatar className="size-10">
                  <AvatarFallback
                    className={
                      avatarStyles[index + 1] ??
                      'bg-muted text-muted-foreground'
                    }
                  >
                    {getInitials(person.name)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium leading-none">{person.name}</p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {person.team}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums">
                  {Math.round(person.goal_achievement_pct)}%
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default TopPerformersCard
