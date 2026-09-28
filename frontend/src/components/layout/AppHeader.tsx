import { ChevronLeft, ChevronRight, Menu, PanelLeft } from 'lucide-react'
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
  const { toggleSidebar, isMobile } = useSidebar()

  const title = pageTitles[pathname] ?? ''

  const currentIndex = periodOptions.findIndex(
    (option) => option.month === period.month && option.year === period.year,
  )
  const canGoToPreviousMonth = currentIndex < periodOptions.length - 1
  const canGoToNextMonth = currentIndex > 0

  const goToOffset = (offset: number) => {
    const option = periodOptions[currentIndex + offset]
    if (option) setPeriod({ year: option.year, month: option.month })
  }

  return (
    <header className="flex h-auto min-h-16 flex-wrap items-center justify-between gap-y-2 border-b px-3 py-2 sm:h-16 sm:flex-nowrap sm:py-0 sm:pl-3 sm:pr-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={toggleSidebar}>
          {isMobile ? <Menu className="size-4" /> : <PanelLeft className="size-4" />}
        </Button>
        <h1 className="font-heading text-lg font-semibold sm:text-2xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!canGoToPreviousMonth}
          onClick={() => goToOffset(1)}
        >
          <ChevronLeft className="size-4" />
        </Button>

        <Select
          value={`${period.year}-${period.month}`}
          onValueChange={(value) => {
            if (!value) return

            const [year, month] = value.split('-').map(Number)
            setPeriod({ year, month })
          }}
        >
          <SelectTrigger className="w-40">
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

        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!canGoToNextMonth}
          onClick={() => goToOffset(-1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </header>
  )
}

export default AppHeader
