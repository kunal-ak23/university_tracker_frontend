"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ChannelPartnerStudentForm } from "@/components/channel-partner-students/channel-partner-student-form"
import { Plus } from "lucide-react"
import { useState } from "react"

interface AddStudentDialogProps {
  programBatchId: number
}

export function AddStudentDialog({ programBatchId }: AddStudentDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Student to Batch</DialogTitle>
        </DialogHeader>
        <ChannelPartnerStudentForm 
          programBatchId={programBatchId} 
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  )
} 