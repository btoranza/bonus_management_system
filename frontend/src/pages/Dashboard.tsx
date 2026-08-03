import AverageSaleCard from '@/components/dashboard/AverageSaleCard'
import GoalAchievementCard from '@/components/dashboard/GoalAchievementCard'
import GoalAchieversCard from '@/components/dashboard/GoalAchieversCard'
import KpiCards from '@/components/dashboard/KpiCards'
import NewCustomersCard from '@/components/dashboard/NewCustomersCard'
import SalesByTeamCard from '@/components/dashboard/SalesByTeamCard'
import SalesTrendCard from '@/components/dashboard/SalesTrendCard'
import TopPerformersCard from '@/components/dashboard/TopPerformersCard'
import TotalBonusByTeamCard from '@/components/dashboard/TotalBonusByTeamCard'
import Spinner from '@/components/ui/spinner'

import useDashboard from '@/hooks/use-dashboard'
import { usePeriod } from '@/providers/PeriodProvider'

const Dashboard = () => {
  const { period } = usePeriod()

  const { data, isPending, error } = useDashboard(period)

  if (isPending) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Error loading dashboard.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5 p-5">
      <KpiCards
        totalSales={data.total_sales}
        totalSalesChangePct={data.total_sales_change_pct}
        totalBonus={data.total_bonus}
        totalBonusChangePct={data.total_bonus_change_pct}
        salesCount={data.sales_count}
        salesCountChangePct={data.sales_count_change_pct}
        salespeopleCount={data.salespeople_count}
      />

      <section className="grid gap-5 lg:grid-cols-3">
        <SalesTrendCard salesTrend={data.sales_trend} />
        <SalesByTeamCard salesByTeam={data.sales_by_team} />
        <GoalAchievementCard
          goalAchievementByTeam={data.goal_achievement_by_team}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <TopPerformersCard topPerformers={data.top_performers} />

        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
          <AverageSaleCard averageSaleByTeam={data.average_sale_by_team} />
          <NewCustomersCard newCustomersByTeam={data.new_customers_by_team} />
          <GoalAchieversCard
            goalAchieversCount={data.goal_achievers_count}
            salespeopleCount={data.salespeople_count}
          />
          <TotalBonusByTeamCard bonusByTeam={data.bonus_by_team} />
        </div>
      </section>
    </div>
  )
}

export default Dashboard
