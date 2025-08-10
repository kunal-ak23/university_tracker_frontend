"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { createUniversityEvent, updateUniversityEvent, UniversityEvent, CreateUniversityEventData } from "@/service/api/university-events"
import { Batch } from "@/types/batch"
import { useToast } from "@/hooks/use-toast"
import {useSession} from "next-auth/react";

interface UniversityEventFormProps {
  universityId: number
  batches?: Batch[]
  event?: UniversityEvent
  mode?: 'create' | 'edit'
  trigger?: React.ReactNode,
}

export function UniversityEventForm({ 
  universityId, 
  batches = [], 
  event, 
  mode = 'create',
  trigger 
}: UniversityEventFormProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession()

  const [formData, setFormData] = useState<CreateUniversityEventData>({
    university: universityId,
    created_by: parseInt(session?.user?.id || '-1'),
    title: event?.title || '',
    description: event?.description || '',
    start_datetime: event?.start_datetime ? new Date(event.start_datetime).toISOString().slice(0, 16) : '',
    end_datetime: event?.end_datetime ? new Date(event.end_datetime).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    batch: event?.batch || undefined,
    notes: event?.notes || '',
    invitees: event?.invitees || ''
  })

  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)

    try {
      if (mode === 'create') {
        await createUniversityEvent(formData)
        toast({
          title: "Success",
          description: "Event created successfully. It is now in draft status.",
        })
      } else if (event) {
        await updateUniversityEvent(event.id, formData)
        toast({
          title: "Success",
          description: "Event updated successfully.",
        })
      }
      
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error('Error saving event:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateUniversityEventData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add Event
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Event' : 'Edit Event'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new event for this university. The event will start as a draft and can be submitted for approval later.'
              : 'Update the event details.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter event location"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter event description"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_datetime">Start Date & Time *</Label>
              <Input
                id="start_datetime"
                type="datetime-local"
                value={formData.start_datetime}
                onChange={(e) => handleInputChange('start_datetime', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end_datetime">End Date & Time *</Label>
              <Input
                id="end_datetime"
                type="datetime-local"
                value={formData.end_datetime}
                onChange={(e) => handleInputChange('end_datetime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="batch">Associated Batch (Optional)</Label>
            <Select
              value={formData.batch?.toString() || "none"}
              onValueChange={(value) => handleInputChange('batch', value === "none" ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a batch (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No batch</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id.toString()}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invitees">Additional Invitees (Optional)</Label>
            <Input
              id="invitees"
              value={formData.invitees}
              onChange={(e) => handleInputChange('invitees', e.target.value)}
              placeholder="Enter email addresses separated by commas"
            />
            <p className="text-sm text-gray-500">
              Example: john@example.com, jane@example.com
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter additional notes"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Update Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 
