import { useEffect, useMemo, useState } from 'react'

import DataTable from '@/components/ui/data-table'
import { getBonusesTableColumns } from '@/components/bonus/BonusTableColumns'
import TableToolbar from '@/components/ui/table-toolbar'
import useDebounce from '@/hooks/use-debounce'
import { useBonuses } from '@/hooks/use-bonuses'
import { usePeriod } from '@/providers/PeriodProvider'
import { TEAM_OPTIONS } from '@/constants/teams'

import type { BonusesSort, SortOrder } from '@/types/bonus.types'

const Bonuses = () => {
  const { period } = usePeriod()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [team, setTeam] = useState<string | null>(null)

  const [sort, setSort] = useState<BonusesSort>('total_bonus')
  const [order, setOrder] = useState<SortOrder>('desc')

  const debouncedSearch = useDebounce(search, 300)

  const limit = 15

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [period.year, period.month, debouncedSearch, team])

  const { data, isPending, isError } = useBonuses({
    year: period.year,
    month: period.month,
    page,
    limit,
    search: debouncedSearch,
    team: team ?? undefined,
    sort,
    order,
  })

  const columns = useMemo(
    () =>
      getBonusesTableColumns({
        sort,
        order,
        onSortChange: (newSort: BonusesSort, newOrder: SortOrder) => {
          setSort(newSort)
          setOrder(newOrder)
        },
      }),
    [sort, order],
  )

  if (isPending) {
    return <p>Loading...</p>
  }

  if (isError || !data) {
    return <p>Failed to load bonuses.</p>
  }

  return (
    <div className="flex h-full flex-col p-5">
      <div className="space-y-5">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search salesperson..."
          filterValue={team}
          onFilterChange={setTeam}
          filterPlaceholder="All teams"
          filterOptions={TEAM_OPTIONS}
        />

        <DataTable
          columns={columns}
          data={data.items}
          page={page}
          totalPages={data.total_pages}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}

export default Bonuses
