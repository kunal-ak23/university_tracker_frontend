"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ProgramForm } from "@/components/forms/program/program-form"

interface AddProgramDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerId: number
  onProgramAdded?: () => void
}

export function AddProgramDialog({
  open,
  onOpenChange,
  providerId,
  onProgramAdded,
}: AddProgramDialogProps) {
  const handleSuccess = () => {
    if (onProgramAdded) {
      onProgramAdded()
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
          <DialogTitle>Add New Program</DialogTitle>
          <DialogDescription>
            Create a new program for this OEM provider.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ProgramForm 
            mode="create" 
            providerId={providerId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

