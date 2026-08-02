import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

type AreaTrendChartProps = {
  data: Record<string, string | number>[]
  categoryKey: string
  valueKey: string
  label: string
  color?: string
  valueFormatter?: (value: number) => string
}

const defaultFormatter = (value: number) => value.toLocaleString()

const AreaTrendChart = ({
  data,
  categoryKey,
  valueKey,
  label,
  color = 'var(--chart-1)',
  valueFormatter = defaultFormatter,
}: AreaTrendChartProps) => {
  const chartConfig = {
    [valueKey]: { label, color },
  } satisfies ChartConfig

  const gradientId = `${valueKey}-fill`

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
      <AreaChart data={data} margin={{ left: 0, right: 12 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={`var(--color-${valueKey})`}
              stopOpacity={0.4}
            />
            <stop
              offset="95%"
              stopColor={`var(--color-${valueKey})`}
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
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
        <Area
          dataKey={valueKey}
          type="monotone"
          fill={`url(#${gradientId})`}
          stroke={`var(--color-${valueKey})`}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export default AreaTrendChart
