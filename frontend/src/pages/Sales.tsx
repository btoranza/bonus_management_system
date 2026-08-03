import { useEffect, useState } from 'react'
import { PAGE_SIZE } from '@/constants/page'
import { getSalesTableColumns } from '@/components/sales/SalesTableColumns'
import DataTable from '@/components/ui/data-table'
import useDebounce from '@/hooks/use-debounce'
import { TEAM_OPTIONS } from '@/constants/teams'
import { useSales } from '@/hooks/use-sales'
import { usePeriod } from '@/providers/PeriodProvider'
import type { SalesSort, SortOrder } from '@/types/sale.types'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import TableToolbar from '@/components/ui/table-toolbar'
import Spinner from '@/components/ui/spinner'

const Sales = () => {
  const { period } = usePeriod()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [team, setTeam] = useState<string | null>(null)

  const [sort, setSort] = useState<SalesSort>('date')
  const [order, setOrder] = useState<SortOrder>('desc')

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [period.year, period.month, debouncedSearch, team])

  const { data, isPending, isError } = useSales({
    year: period.year,
    month: period.month,
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    team: team ?? undefined,
    sort,
    order,
  })

  if (isPending && !data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (isError || !data) {
    return <p>Failed to load sales.</p>
  }

  return (
    <div className="flex h-full flex-col p-5">
      <div className="space-y-5">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search customer, invoice or salesperson..."
          filterValue={team}
          onFilterChange={setTeam}
          filterPlaceholder="All teams"
          filterOptions={TEAM_OPTIONS}
        />

        <DataTable
          columns={getSalesTableColumns({
            sort,
            order,
            onSortChange: (newSort, newOrder) => {
              setSort(newSort)
              setOrder(newOrder)
              setPage(1)
            },
          })}
          data={data.items}
          page={page}
          totalPages={data.total_pages}
          onPageChange={setPage}
        />
      </div>

      <footer className="mt-auto pt-5">
        <div className="flex justify-end">
          <Tooltip>
            <TooltipTrigger render={<span />}>
              <Button
                size="lg"
                variant="default"
                className="min-w-40 cursor-not-allowed opacity-60"
                onClick={(e) => e.preventDefault()}
              >
                <Plus className="size-5" />
                New Sale
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              <p>Coming soon!</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </footer>
    </div>
  )
}

export default Sales
