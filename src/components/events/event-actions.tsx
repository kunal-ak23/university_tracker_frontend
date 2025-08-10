"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, CheckCircle, XCircle } from "lucide-react"
import { SubmitApprovalDialog } from "./submit-approval-dialog"
import { ApprovalDialog } from "./approval-dialog"
import { UniversityEvent } from "@/service/api/university-events"

interface EventActionsProps {
  event: UniversityEvent
  onEventUpdate: () => void
}

export function EventActions({ event, onEventUpdate }: EventActionsProps) {
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve')

  const handleSubmitSuccess = () => {
    onEventUpdate()
  }

  const handleApprovalSuccess = () => {
    onEventUpdate()
  }

  const openApprovalDialog = (action: 'approve' | 'reject') => {
    setApprovalAction(action)
    setIsApprovalDialogOpen(true)
  }

  if (event.status === 'draft' && event.can_be_submitted) {
    return (
      <>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => setIsSubmitDialogOpen(true)}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit for Approval
          </Button>
        </div>
        
        <SubmitApprovalDialog
          eventId={event.id}
          eventTitle={event.title}
          isOpen={isSubmitDialogOpen}
          onClose={() => setIsSubmitDialogOpen(false)}
          onSuccess={handleSubmitSuccess}
        />
      </>
    )
  }

  if (event.status === 'pending_approval' && event.can_be_approved) {
    return (
      <>
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
          <div className="space-y-2">
            <Button 
              className="w-full" 
              variant="default"
              onClick={() => openApprovalDialog('approve')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Event
            </Button>
            <Button 
              className="w-full" 
              variant="destructive"
              onClick={() => openApprovalDialog('reject')}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Event
            </Button>
          </div>
        </div>

        <ApprovalDialog
          eventId={event.id}
          eventTitle={event.title}
          action={approvalAction}
          isOpen={isApprovalDialogOpen}
          onClose={() => setIsApprovalDialogOpen(false)}
          onSuccess={handleApprovalSuccess}
        />
      </>
    )
  }

  return null
} 