import type { ReactNode } from 'react'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import Spinner from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface PaginationBarProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  isFetching?: boolean
  className?: string
}

const PaginationBar = ({
  page,
  totalPages,
  onPageChange,
  isFetching = false,
  className,
}: PaginationBarProps) => (
  <div className={className}>
    <Pagination className="justify-between">
      <div className="flex items-center gap-2">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        {isFetching && (
          <span role="status" aria-label="Loading">
            <Spinner className="size-4" />
          </span>
        )}
      </div>

      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (page > 1 && !isFetching) {
                onPageChange(page - 1)
              }
            }}
            className={
              page === 1 || isFetching
                ? 'pointer-events-none opacity-50'
                : ''
            }
          />
        </PaginationItem>

        <PaginationItem>
          <PaginationLink href="#" isActive>
            {page}
          </PaginationLink>
        </PaginationItem>

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (page < totalPages && !isFetching) {
                onPageChange(page + 1)
              }
            }}
            className={
              page === totalPages || isFetching
                ? 'pointer-events-none opacity-50'
                : ''
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  mobileCard?: (row: TData) => ReactNode
  isFetching?: boolean
}

const DataTable = <TData, TValue>({
  columns,
  data,
  page,
  totalPages,
  onPageChange,
  mobileCard,
  isFetching = false,
}: DataTableProps<TData, TValue>) => {
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table's API isn't compiler-memoizable
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const isMobile = useIsMobile()
  const rows = table.getRowModel().rows

  const showPagination =
    page !== undefined &&
    totalPages !== undefined &&
    onPageChange !== undefined &&
    totalPages > 1

  if (isMobile && mobileCard) {
    return (
      <div className="space-y-3">
        <div
          className={cn('transition-opacity', isFetching && 'opacity-60')}
          aria-busy={isFetching}
        >
          {rows.length ? (
            <div className="flex flex-col gap-3">
              {rows.map((row) => (
                <div key={row.id}>{mobileCard(row.original)}</div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border py-10 text-center text-sm text-muted-foreground">
              No results.
            </div>
          )}
        </div>

        {showPagination && (
          <PaginationBar
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            isFetching={isFetching}
            className="rounded-md border px-4 py-3"
          />
        )}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <div
        className={cn('transition-opacity', isFetching && 'opacity-60')}
        aria-busy={isFetching}
      >
        <Table>
          <TableHeader className="bg-chart-1 dark:bg-chart-2 font-semibold font-semibold text-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <PaginationBar
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          isFetching={isFetching}
          className="border-t px-4 py-3"
        />
      )}
    </div>
  )
}

export default DataTable
