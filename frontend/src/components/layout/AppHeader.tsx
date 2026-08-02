import { PanelLeft } from 'lucide-react'
import { useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePeriod } from '@/providers/PeriodProvider'
import { useSidebar } from '@/providers/SidebarProvider'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/sales': 'Sales',
  '/salespeople': 'Salespeople',
  '/bonuses': 'Bonuses',
}

const periodOptions = Array.from({ length: 12 }, (_, i) => {
  const date = new Date()
  date.setDate(1)
  date.setMonth(date.getMonth() - i)

  return {
    value: `${date.getFullYear()}-${date.getMonth() + 1}`,
    label: date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }),
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  }
})

const AppHeader = () => {
  const { period, setPeriod } = usePeriod()
  const { pathname } = useLocation()
  const { toggleSidebar } = useSidebar()

  const title = pageTitles[pathname] ?? ''

  return (
    <header className="flex h-16 items-center justify-between border-b pl-3 pr-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
          <PanelLeft className="size-4" />
        </Button>
        <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      </div>

      <Select
        value={`${period.year}-${period.month}`}
        onValueChange={(value) => {
          if (!value) return

          const [year, month] = value.split('-').map(Number)
          setPeriod({ year, month })
        }}
      >
        <SelectTrigger>
          <SelectValue>
            {(value: string) =>
              periodOptions.find((option) => option.value === value)?.label
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {periodOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </header>
  )
}

export default AppHeader
