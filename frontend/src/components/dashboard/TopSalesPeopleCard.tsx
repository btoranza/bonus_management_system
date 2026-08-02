import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const topSalespeople = [
  {
    id: 1,
    name: 'Sarah Johnson',
    team: 'Enterprise',
    sales: 82500,
    bonus: 6250,
  },
  {
    id: 2,
    name: 'Michael Brown',
    team: 'SMB',
    sales: 76200,
    bonus: 4980,
  },
  {
    id: 3,
    name: 'Emma Wilson',
    team: 'Mid-Market',
    sales: 71800,
    bonus: 4650,
  },
  {
    id: 4,
    name: 'James Taylor',
    team: 'Enterprise',
    sales: 65900,
    bonus: 4200,
  },
  {
    id: 5,
    name: 'Olivia Davis',
    team: 'SMB',
    sales: 62100,
    bonus: 3980,
  },
]

const avatarStyles: Record<number, string> = {
  1: 'bg-yellow-500/15 text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-300',
  2: 'bg-slate-500/15 text-slate-700 dark:bg-slate-300/15 dark:text-slate-300',
  3: 'bg-orange-500/15 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300',
}

const formatCurrency = (value: number) => `€ ${value.toLocaleString('en-US')}`

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)

const TopSalespeopleCard = () => {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Top Salespeople</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between gap-3 overflow-y-auto">
        {topSalespeople.map((person, index) => (
          <div key={person.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-4 text-sm font-semibold text-muted-foreground">
                {index + 1}
              </span>

              <Avatar className="size-10">
                <AvatarFallback
                  className={
                    avatarStyles[index + 1] ?? 'bg-muted text-muted-foreground'
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
              <p className="font-semibold tabular-nums">
                {formatCurrency(person.sales)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Bonus {formatCurrency(person.bonus)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export default TopSalespeopleCard
