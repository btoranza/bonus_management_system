import { useEffect, useState } from 'react'

import { PAGE_SIZE } from '@/constants/page'
import { TEAM_OPTIONS } from '@/constants/teams'
import DataTable from '@/components/ui/data-table'
import TableToolbar from '@/components/ui/table-toolbar'
import useDebounce from '@/hooks/use-debounce'
import { useSalespeople } from '@/hooks/use-salespeople'
import { getSalespeopleTableColumns } from '@/components/salespeople/SalespeopleTableColumns'
import Spinner from '@/components/ui/spinner'
import type { SalespeopleSort, SortOrder } from '@/types/salesperson.types'

const Salespeople = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [team, setTeam] = useState<string | null>(null)
  const [sort, setSort] = useState<SalespeopleSort>('first_name')
  const [order, setOrder] = useState<SortOrder>('asc')

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [debouncedSearch, team])

  const { data, isPending, isError } = useSalespeople({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    team: team ?? undefined,
    sort,
    order,
  })

  if (isError) {
    return <p>Failed to load salespeople.</p>
  }

  return (
    <div className="flex h-full flex-col p-5">
      <div className="space-y-5">
        <TableToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search salesperson, email or ID..."
          filterValue={team}
          onFilterChange={setTeam}
          filterPlaceholder="All teams"
          filterOptions={TEAM_OPTIONS}
        />

        {isPending && !data ? (
          <div className="flex h-[500px] items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <DataTable
            columns={getSalespeopleTableColumns({
              sort,
              order,
              onSortChange: (newSort, newOrder) => {
                setSort(newSort)
                setOrder(newOrder)
                setPage(1)
              },
            })}
            data={data?.items ?? []}
            page={page}
            totalPages={data?.total_pages ?? 1}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  )
}

export default Salespeople
