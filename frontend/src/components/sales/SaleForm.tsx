import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const saleSchema = z.object({
  salesperson_id: z.string().min(1, 'Salesperson is required'),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  customer_id: z.string().min(1, 'Customer is required'),
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_status: z.enum(['new', 'existing']),
  amount: z.number().positive('Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
})

type SaleFormValues = z.infer<typeof saleSchema>

const SaleForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customer_status: 'existing',
    },
  })

  const onSubmit = (values: SaleFormValues) => {
    console.log(values)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="text-sm font-medium">Invoice number</label>
        <Input {...register('invoice_number')} placeholder="INV-202608-01578" />
        {errors.invoice_number && (
          <p className="mt-1 text-sm text-destructive">
            {errors.invoice_number.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Customer name</label>
        <Input {...register('customer_name')} />
        {errors.customer_name && (
          <p className="mt-1 text-sm text-destructive">
            {errors.customer_name.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Amount</label>
        <Input
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="mt-1 text-sm text-destructive">
            {errors.amount.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Date</label>
        <Input type="date" {...register('date')} />
        {errors.date && (
          <p className="mt-1 text-sm text-destructive">{errors.date.message}</p>
        )}
      </div>

      <input type="hidden" {...register('salesperson_id')} />
      <input type="hidden" {...register('customer_id')} />

      <Button type="submit" onClick={() => console.log('Creating sale')}>
        Create Sale
      </Button>
    </form>
  )
}

export default SaleForm
