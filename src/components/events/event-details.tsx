"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Users, FileText, CheckCircle, XCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UniversityEvent, getUniversityEvent } from "@/service/api/university-events"
import { EventActions } from "./event-actions"

interface EventDetailsProps {
  initialEvent: UniversityEvent
}

export function EventDetails({ initialEvent }: EventDetailsProps) {
  const [event, setEvent] = useState<UniversityEvent>(initialEvent)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshEvent = async () => {
    setIsRefreshing(true)
    try {
      const updatedEvent = await getUniversityEvent(event.id)
      setEvent(updatedEvent)
    } catch (error) {
      console.error('Error refreshing event:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'upcoming':
        return 'bg-green-100 text-green-800'
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      full: date.toLocaleString()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{event.title}</h2>
          <p className="text-gray-600">{event.university_details?.name}</p>
        </div>
        <Badge className={getStatusColor(event.status)}>
          {event.status.replace('_', ' ').charAt(0).toUpperCase() + event.status.replace('_', ' ').slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Description</h4>
              <p className="text-gray-600 mt-1">{event.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Start Date & Time</h4>
                <p className="text-gray-600 mt-1">{formatDateTime(event.start_datetime).full}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">End Date & Time</h4>
                <p className="text-gray-600 mt-1">{formatDateTime(event.end_datetime).full}</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </h4>
              <p className="text-gray-600 mt-1">{event.location}</p>
            </div>

            {event.batch_details && (
              <div>
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Associated Batch
                </h4>
                <p className="text-gray-600 mt-1">{event.batch_details.name}</p>
              </div>
            )}

            {event.notes && (
              <div>
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h4>
                <p className="text-gray-600 mt-1">{event.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Status & Actions</CardTitle>
            <CardDescription>
              Current status and available actions for this event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">Current Status</h4>
              <Badge className={`mt-1 ${getStatusColor(event.status)}`}>
                {event.status.replace('_', ' ').charAt(0).toUpperCase() + event.status.replace('_', ' ').slice(1)}
              </Badge>
            </div>

            <EventActions event={event} onEventUpdate={refreshEvent} />

            {event.submitted_for_approval_at && (
              <div>
                <h4 className="font-medium text-gray-900">Submitted for Approval</h4>
                <p className="text-gray-600 mt-1">
                  {formatDateTime(event.submitted_for_approval_at).full}
                </p>
              </div>
            )}

            {event.approved_at && (
              <div>
                <h4 className="font-medium text-gray-900">Approved</h4>
                <p className="text-gray-600 mt-1">
                  {formatDateTime(event.approved_at).full}
                </p>
                {event.approved_by_details && (
                  <p className="text-gray-600 text-sm">
                    by {event.approved_by_details.username}
                  </p>
                )}
              </div>
            )}

            {event.rejection_reason && (
              <div>
                <h4 className="font-medium text-gray-900">Rejection Reason</h4>
                <p className="text-gray-600 mt-1">{event.rejection_reason}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900">Created</h4>
              <p className="text-gray-600 mt-1">
                {formatDateTime(event.created_at).full}
              </p>
              {event.created_by_details && (
                <p className="text-gray-600 text-sm">
                  by {event.created_by_details.username}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {event.invitees && (
        <Card>
          <CardHeader>
            <CardTitle>Invitees</CardTitle>
            <CardDescription>
              Additional invitees for this event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {event.invitee_emails?.map((email, index) => (
                <Badge key={index} variant="outline">
                  {email}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {event.integration_status !== 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>
              Status of external integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Integration Status:</span>
                <Badge variant="outline">{event.integration_status}</Badge>
              </div>
              {event.notion_page_url && (
                <div>
                  <span className="font-medium">Notion Page:</span>
                  <a 
                    href={event.notion_page_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-2"
                  >
                    View in Notion
                  </a>
                </div>
              )}
              {event.integration_notes && (
                <div>
                  <span className="font-medium">Notes:</span>
                  <p className="text-gray-600 mt-1">{event.integration_notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 