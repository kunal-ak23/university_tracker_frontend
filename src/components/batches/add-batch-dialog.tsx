"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { BatchForm } from "@/components/batches/batch-form"

interface AddBatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  universityId: number
  onBatchAdded?: () => void
}

export function AddBatchDialog({
  open,
  onOpenChange,
  universityId,
  onBatchAdded,
}: AddBatchDialogProps) {
  const handleSuccess = () => {
    if (onBatchAdded) {
      onBatchAdded()
    }
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Batch</DialogTitle>
          <DialogDescription>
            Create a new batch for this university. Select the stream, program, and other details.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <BatchForm 
            mode="create" 
            initialValues={{
              university: universityId.toString()
            }}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

