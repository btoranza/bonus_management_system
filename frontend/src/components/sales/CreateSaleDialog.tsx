import { useState } from 'react'
import { Plus } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { CustomerOption } from './CustomerCombobox'
import NewCustomerForm from './NewCustomerForm'
import SaleForm from './SaleForm'

const CreateSaleDialog = () => {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'sale' | 'new-customer'>('sale')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(
    null,
  )

  const handleCustomerCreated = (customer: CustomerOption) => {
    setSelectedCustomer(customer)
    setView('sale')
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      setView('sale')
      setSelectedCustomer(null)
    }
  }

  const handleSaleCreated = () => {
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="lg" className="min-w-40">
            <Plus className="size-5" />
            New Sale
          </Button>
        }
      />

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="pb-2">
          <DialogTitle>New Sale</DialogTitle>
        </DialogHeader>

        <div className="overflow-hidden">
          <div
            className="flex w-[200%] transition-transform duration-300 ease-in-out"
            style={{
              transform: view === 'sale' ? 'translateX(0%)' : 'translateX(-50%)',
            }}
          >
            <div className="w-1/2 shrink-0 pr-1">
              <SaleForm
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
                onRequestNewCustomer={() => setView('new-customer')}
                onCreated={handleSaleCreated}
              />
            </div>
            <div className="w-1/2 shrink-0 pl-1">
              <NewCustomerForm
                onBack={() => setView('sale')}
                onCreated={handleCustomerCreated}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSaleDialog
