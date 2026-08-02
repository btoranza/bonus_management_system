import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

type BarComparisonChartProps = {
  data: Record<string, string | number>[]
  categoryKey: string
  valueKey: string
  label: string
  color?: string
  valueFormatter?: (value: number) => string
}

const defaultFormatter = (value: number) => value.toLocaleString()

const BarComparisonChart = ({
  data,
  categoryKey,
  valueKey,
  label,
  color = 'var(--chart-2)',
  valueFormatter = defaultFormatter,
}: BarComparisonChartProps) => {
  const chartConfig = {
    [valueKey]: { label, color },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
      <BarChart data={data} margin={{ left: 0, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={categoryKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={48}
          tickFormatter={valueFormatter}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value) => valueFormatter(Number(value))}
            />
          }
        />
        <Bar
          dataKey={valueKey}
          fill={`var(--color-${valueKey})`}
          radius={4}
          maxBarSize={56}
        />
      </BarChart>
    </ChartContainer>
  )
}

export default BarComparisonChart
