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
import { useCustomers } from '@/hooks/use-customers'

export interface CustomerOption {
  value: string
  label: string
}

interface CustomerComboboxProps {
  value: CustomerOption | null
  onChange: (option: CustomerOption | null) => void
  disabled?: boolean
  hasError?: boolean
}

const CustomerCombobox = ({
  value,
  onChange,
  disabled,
  hasError,
}: CustomerComboboxProps) => {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isFetching } = useCustomers({
    search: debouncedSearch,
    limit: 1000,
  })

  const items: CustomerOption[] = useMemo(
    () =>
      (data?.items ?? []).map((customer) => ({
        value: customer.customer_id,
        label: customer.customer_name,
      })),
    [data],
  )

  return (
    <Combobox<CustomerOption>
      items={items}
      filter={null}
      value={value}
      onValueChange={onChange}
      onInputValueChange={setSearch}
      disabled={disabled}
    >
      <ComboboxInput
        className="h-10"
        placeholder="Search customer by name or ID..."
        showClear
        aria-invalid={hasError}
      >
        <InputGroupAddon align="inline-start">
          <SearchIcon />
        </InputGroupAddon>
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxList>
          {(item: CustomerOption) => (
            <ComboboxItem key={item.value} value={item}>
              <span className="flex flex-col">
                <span>{item.label}</span>
                <span className="text-xs text-muted-foreground">
                  {item.value}
                </span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>
          {isFetching ? 'Searching...' : 'No customers found.'}
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  )
}

export default CustomerCombobox
