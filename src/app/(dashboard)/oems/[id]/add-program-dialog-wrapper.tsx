"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AddProgramDialog } from "@/components/programs/add-program-dialog"

interface AddProgramDialogWrapperProps {
  providerId: number
  onProgramAdded?: () => void
}

export function AddProgramDialogWrapper({ 
  providerId,
  onProgramAdded 
}: AddProgramDialogWrapperProps) {
  const [open, setOpen] = useState(false)

  const handleProgramAdded = () => {
    if (onProgramAdded) {
      onProgramAdded()
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Program
      </Button>
      <AddProgramDialog
        open={open}
        onOpenChange={setOpen}
        providerId={providerId}
        onProgramAdded={handleProgramAdded}
      />
    </>
  )
}

