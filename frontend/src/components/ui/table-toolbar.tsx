import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterOption {
  label: string
  value: string
}

interface TableToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  filterValue: string | null
  onFilterChange: (value: string | null) => void
  filterPlaceholder: string
  filterOptions: FilterOption[]
}

const TableToolbar = ({
  search,
  onSearchChange,
  searchPlaceholder,
  filterValue,
  onFilterChange,
  filterPlaceholder,
  filterOptions,
}: TableToolbarProps) => {
  const hasFilters = search !== '' || filterValue !== null

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex items-center gap-2">
        <Select
          items={filterOptions}
          value={filterValue ?? 'all'}
          onValueChange={(value) =>
            onFilterChange(value === 'all' ? null : value)
          }
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder={filterPlaceholder} />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          disabled={!hasFilters}
          onClick={() => {
            onSearchChange('')
            onFilterChange(null)
          }}
        >
          Clear filters
        </Button>
      </div>
    </div>
  )
}

export default TableToolbar
