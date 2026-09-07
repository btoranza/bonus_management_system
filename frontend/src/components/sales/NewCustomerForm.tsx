import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeftIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateCustomer } from '@/hooks/use-customers'
import type { CustomerOption } from './CustomerCombobox'

const newCustomerSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
})

type NewCustomerFormValues = z.infer<typeof newCustomerSchema>

interface NewCustomerFormProps {
  onBack: () => void
  onCreated: (customer: CustomerOption) => void
}

const NewCustomerForm = ({ onBack, onCreated }: NewCustomerFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewCustomerFormValues>({
    resolver: zodResolver(newCustomerSchema),
  })

  const { mutate, isPending, error } = useCreateCustomer()

  const onSubmit = (values: NewCustomerFormValues) => {
    mutate(values, {
      onSuccess: (customer) => {
        reset()
        onCreated({ value: customer.customer_id, label: customer.customer_name })
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </button>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          className="h-10"
          placeholder="Customer name"
          aria-invalid={!!errors.customer_name}
          {...register('customer_name')}
        />
        {errors.customer_name && (
          <p className="text-sm text-destructive">
            {errors.customer_name.message}
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive">
            Could not create customer. Please try again.
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="h-10" disabled={isPending}>
          {isPending ? 'Creating...' : 'Create customer'}
        </Button>
      </div>
    </form>
  )
}

export default NewCustomerForm
