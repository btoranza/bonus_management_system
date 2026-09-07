import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToastManager } from '@/components/ui/toast'
import { useCreateSale } from '@/hooks/use-sales'
import CustomerCombobox, { type CustomerOption } from './CustomerCombobox'
import SalespersonSelect from './SalespersonSelect'

const saleSchema = z.object({
  salesperson_id: z.string().min(1, 'Salesperson is required'),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  customer_id: z.string().min(1, 'Customer is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
})

type SaleFormValues = z.infer<typeof saleSchema>

interface SaleFormProps {
  selectedCustomer: CustomerOption | null
  onSelectCustomer: (customer: CustomerOption | null) => void
  onRequestNewCustomer: () => void
  onCreated: () => void
}

const SaleForm = ({
  selectedCustomer,
  onSelectCustomer,
  onRequestNewCustomer,
  onCreated,
}: SaleFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
  })

  const { mutate, isPending, error } = useCreateSale()
  const { add: addToast } = useToastManager()

  // Keep the form's customer_id in sync when the selection is set externally (e.g. after creating a customer)
  useEffect(() => {
    setValue('customer_id', selectedCustomer?.value ?? '', {
      shouldValidate: Boolean(selectedCustomer),
    })
  }, [selectedCustomer, setValue])

  const onSubmit = (values: SaleFormValues) => {
    mutate(values, {
      onSuccess: () => {
        addToast({ title: 'Sale created successfully!', type: 'success' })
        onCreated()
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Salesperson</label>
          <Controller
            control={control}
            name="salesperson_id"
            render={({ field }) => (
              <SalespersonSelect
                value={field.value}
                onChange={field.onChange}
                hasError={!!errors.salesperson_id}
              />
            )}
          />
          {errors.salesperson_id && (
            <p className="text-sm text-destructive">
              {errors.salesperson_id.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Date</label>
          <Input type="date" className="h-10" {...register('date')} />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Customer</label>
          <Controller
            control={control}
            name="customer_id"
            render={({ field }) => (
              <CustomerCombobox
                value={selectedCustomer}
                onChange={(option) => {
                  onSelectCustomer(option)
                  field.onChange(option?.value ?? '')
                }}
                hasError={!!errors.customer_id}
              />
            )}
          />
          {errors.customer_id && (
            <p className="text-sm text-destructive">
              {errors.customer_id.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium opacity-0">New customer</label>
          <Button
            type="button"
            variant="outline"
            className="h-10 w-full"
            onClick={onRequestNewCustomer}
          >
            <PlusIcon />
            New customer
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Invoice number</label>
          <Input
            className="h-10"
            {...register('invoice_number')}
            placeholder="INV-202608-01578"
          />
          {errors.invoice_number && (
            <p className="text-sm text-destructive">
              {errors.invoice_number.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.01"
            className="h-10"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">
          Could not create the sale. Please try again.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" className="h-10" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create Sale'}
        </Button>
      </div>
    </form>
  )
}

export default SaleForm
