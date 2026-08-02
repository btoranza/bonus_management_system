import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const Dashboard = () => {
  return (
    <div className="space-y-6 p-6">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Sales
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-4xl font-bold tracking-tight">€ 425,000</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Bonus</CardTitle>
          </CardHeader>
          <CardContent />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
          </CardHeader>
          <CardContent />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salespeople</CardTitle>
          </CardHeader>
          <CardContent />
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Team</CardTitle>
          </CardHeader>
          <CardContent />
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Salesperson</CardTitle>
          </CardHeader>
          <CardContent />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Achievement</CardTitle>
          </CardHeader>
          <CardContent />
        </Card>
      </section>
    </div>
  )
}

export default Dashboard
