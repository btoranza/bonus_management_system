import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const NewCustomersCard = () => {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>New Customers</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-4xl font-bold tracking-tight">34</p>

        <p className="mt-4 text-sm font-medium text-success">
          27% of total customers
        </p>
      </CardContent>
    </Card>
  )
}

export default NewCustomersCard
