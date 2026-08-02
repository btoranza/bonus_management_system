import AverageSaleCard from '@/components/dashboard/AverageSaleCard'
import GoalAchieversCard from '@/components/dashboard/GoalAchieversCard'
import KpiCards from '@/components/dashboard/KpiCards'
import NewCustomersCard from '@/components/dashboard/NewCustomersCard'
import SalesByTeamCard from '@/components/dashboard/SalesByTeamCard'
import SalesTrendCard from '@/components/dashboard/SalesTrendCard'
import TopSalespeopleCard from '@/components/dashboard/TopSalesPeopleCard'
import TotalBonusByTeamCard from '@/components/dashboard/TotalBonusByTeamCard'
import GoalAchievementCard from '@/components/dashboard/GoalAchievementCard'

const Dashboard = () => {
  return (
    <div className="space-y-5 p-5">
      <KpiCards />

      <section className="grid gap-5 lg:grid-cols-3">
        <SalesTrendCard />
        <SalesByTeamCard />
        <GoalAchievementCard />
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <TopSalespeopleCard />

        <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
          <AverageSaleCard />
          <NewCustomersCard />
          <GoalAchieversCard />
          <TotalBonusByTeamCard />
        </div>
      </section>
    </div>
  )
}

export default Dashboard
