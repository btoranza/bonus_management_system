import { useMemo, useState } from 'react'
import { SearchIcon } from 'lucide-react'

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { InputGroupAddon } from '@/components/ui/input-group'
import useDebounce from '@/hooks/use-debounce'
import { useSalespeople } from '@/hooks/use-salespeople'

interface SalespersonOption {
  value: string
  label: string
}

interface SalespersonSelectProps {
  value: string
  onChange: (salespersonId: string) => void
  disabled?: boolean
  hasError?: boolean
}

const SalespersonSelect = ({
  onChange,
  disabled,
  hasError,
}: SalespersonSelectProps) => {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<SalespersonOption | null>(null)
  const debouncedSearch = useDebounce(search, 300)

  const { data, isFetching } = useSalespeople({
    page: 1,
    limit: 1000,
    search: debouncedSearch,
    sort: 'first_name',
    order: 'asc',
  })

  const items: SalespersonOption[] = useMemo(
    () =>
      (data?.items ?? [])
        .filter((person) => person.active)
        .map((person) => ({
          value: person.salesperson_id,
          label: `${person.first_name} ${person.last_name} (${person.team})`,
        })),
    [data],
  )

  const handleValueChange = (option: SalespersonOption | null) => {
    setSelected(option)
    onChange(option?.value ?? '')
  }

  return (
    <Combobox<SalespersonOption>
      items={items}
      filter={null}
      value={selected}
      onValueChange={handleValueChange}
      onInputValueChange={setSearch}
      disabled={disabled}
    >
      <ComboboxInput
        className="h-10"
        placeholder="Search salesperson by name..."
        showClear
        aria-invalid={hasError}
      >
        <InputGroupAddon align="inline-start">
          <SearchIcon />
        </InputGroupAddon>
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxList>
          {(item: SalespersonOption) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>
          {isFetching ? 'Searching...' : 'No salespeople found.'}
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  )
}

export default SalespersonSelect

