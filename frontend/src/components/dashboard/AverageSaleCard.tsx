import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const AverageSaleCard = () => {
  return (
    <Card className="lg:h-full">
      <CardHeader>
        <CardTitle>Average Sale</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-4xl font-bold tracking-tight tabular-nums">
            €3,425
          </p>

          <p className="pt-1 text-2sm font-semibold leading-none tabular-nums">
            124 sales
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <p className="text-success text-sm font-medium">
            ↑ 8.2% vs previous period
          </p>{' '}
        </div>
      </CardContent>
    </Card>
  )
}

export default AverageSaleCard
