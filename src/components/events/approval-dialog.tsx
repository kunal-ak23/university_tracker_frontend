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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { approveEvent } from "@/service/api/university-events"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

interface ApprovalDialogProps {
  eventId: number
  eventTitle: string
  action: 'approve' | 'reject'
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ApprovalDialog({
  eventId,
  eventTitle,
  action,
  isOpen,
  onClose,
  onSuccess,
}: ApprovalDialogProps) {
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const isReject = action === 'reject'
  const title = isReject ? "Reject Event" : "Approve Event"
  const description = isReject 
    ? `Are you sure you want to reject "${eventTitle}"? Please provide a reason for rejection.`
    : `Are you sure you want to approve "${eventTitle}"?`

  const handleSubmit = async () => {
    if (isReject && !reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const data = {
        action,
        ...(isReject && { reason: reason.trim() })
      }
      
      await approveEvent(eventId, data)
      toast({
        title: "Success",
        description: `Event ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      })
      onSuccess()
      onClose()
      setReason("")
    } catch (error) {
      console.error(`Error ${action}ing event:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} event. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        {isReject && (
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for rejecting this event..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            variant={isReject ? "destructive" : "default"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isReject ? "Rejecting..." : "Approving..."}
              </>
            ) : (
              <>
                {isReject ? (
                  <XCircle className="mr-2 h-4 w-4" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                {isReject ? "Reject Event" : "Approve Event"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 