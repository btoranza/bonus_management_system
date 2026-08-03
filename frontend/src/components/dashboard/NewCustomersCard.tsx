import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ChangeIndicator from '@/components/ui/change-indicator'

import type { TeamNewCustomers } from '@/types/dashboard.types'

interface NewCustomersCardProps {
  newCustomersByTeam: TeamNewCustomers[]
}

const NewCustomersCard = ({ newCustomersByTeam }: NewCustomersCardProps) => {
  return (
    <Card className="lg:h-full">
      <CardHeader>
        <CardTitle>New Customers by Team</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-3 gap-4">
        {newCustomersByTeam.map(
          ({ team, new_customers_count, new_customers_change_pct }) => {
            const hasCustomers = new_customers_count > 0

            return (
              <div key={team} className="text-center">
                <p className="text-sm font-medium">{team}</p>

                <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums">
                  {new_customers_count}
                </p>

                <p className="mt-1 text-xs">
                  {hasCustomers ? (
                    <ChangeIndicator
                      value={new_customers_change_pct ?? 0}
                      variant="arrow"
                      className="text-xs"
                    />
                  ) : (
                    <span className="text-muted-foreground">
                      No new customers
                    </span>
                  )}
                </p>
              </div>
            )
          },
        )}
      </CardContent>
    </Card>
  )
}

export default NewCustomersCard
