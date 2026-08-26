import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import SaleForm from './SaleForm'

const CreateSaleDialog = () => {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button size="lg" className="min-w-40">
            <Plus className="size-5" />
            New Sale
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Sale</DialogTitle>
          <SaleForm />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSaleDialog
