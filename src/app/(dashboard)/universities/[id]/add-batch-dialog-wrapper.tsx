"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddBatchDialog } from "@/components/batches/add-batch-dialog"

interface AddBatchDialogWrapperProps {
  universityId: number
  onBatchAdded?: () => void
}

export function AddBatchDialogWrapper({ 
  universityId,
  onBatchAdded 
}: AddBatchDialogWrapperProps) {
  const [open, setOpen] = useState(false)

  const handleBatchAdded = () => {
    if (onBatchAdded) {
      onBatchAdded()
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Batch
      </Button>
      <AddBatchDialog
        open={open}
        onOpenChange={setOpen}
        universityId={universityId}
        onBatchAdded={handleBatchAdded}
      />
    </>
  )
}

