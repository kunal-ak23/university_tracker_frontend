"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { submitEventForApproval } from "@/service/api/university-events"
import { Loader2, Send } from "lucide-react"

interface SubmitApprovalDialogProps {
  eventId: number
  eventTitle: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function SubmitApprovalDialog({
  eventId,
  eventTitle,
  isOpen,
  onClose,
  onSuccess,
}: SubmitApprovalDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await submitEventForApproval(eventId)
      toast({
        title: "Success",
        description: "Event submitted for approval successfully.",
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error submitting event for approval:", error)
      toast({
        title: "Error",
        description: "Failed to submit event for approval. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Event for Approval</DialogTitle>
          <DialogDescription>
            Are you sure you want to submit "{eventTitle}" for approval? 
            Once submitted, the event will be reviewed by university POCs.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit for Approval
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 