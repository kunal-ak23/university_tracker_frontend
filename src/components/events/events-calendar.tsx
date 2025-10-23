"use client"

import { useState } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "./events-calendar.css"
import { UniversityEvent } from "@/service/api/university-events"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar as CalendarIcon, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"

const localizer = momentLocalizer(moment)

interface EventsCalendarProps {
  events: UniversityEvent[]
  onNavigate?: (date: Date) => void
  onView?: (view: string) => void
  onSelectEvent?: (event: UniversityEvent) => void
}

export function EventsCalendar({ events, onNavigate, onView, onSelectEvent }: EventsCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<UniversityEvent | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return '#6B7280' // gray
      case 'pending_approval':
        return '#F59E0B' // yellow
      case 'approved':
        return '#3B82F6' // blue
      case 'rejected':
        return '#EF4444' // red
      case 'upcoming':
        return '#10B981' // green
      case 'ongoing':
        return '#10B981' // green
      case 'completed':
        return '#3B82F6' // blue
      case 'cancelled':
        return '#EF4444' // red
      default:
        return '#6B7280' // gray
    }
  }

  const getStatusText = (status: string) => {
    return status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)
  }

  // Transform events for react-big-calendar
  const calendarEvents = events.map(event => {
    // Parse the datetime strings and create dates in local timezone
    const startDate = new Date(event.start_datetime)
    const endDate = new Date(event.end_datetime)
    
    
    // If dates are invalid, skip this event
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.warn(`Skipping event ${event.id} due to invalid dates`)
      return null
    }
    
    return {
      id: event.id,
      title: event.title,
      start: startDate,
      end: endDate,
      resource: event,
      style: {
        backgroundColor: getStatusColor(event.status),
        borderColor: getStatusColor(event.status),
        color: 'white',
        borderRadius: '4px',
        border: 'none',
        fontSize: '12px',
        padding: '2px 4px',
      }
    }
  }).filter(Boolean) // Remove null entries
  
  // Add a test event to see if calendar can display anything
  const testEvent = {
    id: 'test-1',
    title: 'Test Event',
    start: new Date(),
    end: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    resource: { id: 'test-1', title: 'Test Event', status: 'approved' },
    style: {
      backgroundColor: '#10B981',
      borderColor: '#10B981',
      color: 'white',
      borderRadius: '4px',
      border: 'none',
      fontSize: '12px',
      padding: '2px 4px',
    }
  }
  
  const allEvents = [...calendarEvents, testEvent]

  const eventStyleGetter = (event: any) => {
    return {
      style: {
        backgroundColor: getStatusColor(event.resource.status),
        borderColor: getStatusColor(event.resource.status),
        color: 'white',
        borderRadius: '4px',
        border: 'none',
        fontSize: '12px',
        padding: '2px 4px',
      }
    }
  }

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource)
    onSelectEvent?.(event.resource)
  }

  const handleNavigate = (date: Date) => {
    setCurrentDate(date)
    onNavigate?.(date)
  }

  const handleViewChange = (view: string) => {
    onView?.(view)
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    onNavigate?.(today)
  }

  const goToFirstEvent = () => {
    if (events.length > 0) {
      const firstEventDate = new Date(events[0].start_datetime)
      setCurrentDate(firstEventDate)
      onNavigate?.(firstEventDate)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      full: date.toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex gap-2">
        <Button 
          onClick={goToToday}
          size="sm"
          variant="outline"
        >
          Go to Today
        </Button>
        <Button 
          onClick={goToFirstEvent}
          size="sm"
          variant="outline"
        >
          Go to First Event
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden calendar-container">
        <Calendar
        localizer={localizer}
        events={allEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "700px" }}
        date={currentDate}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day', 'agenda']}
        defaultView="month"
        popup
        showMultiDayTimes
        step={30}
        timeslots={2}
        selectable
        onSelectSlot={(slotInfo) => {
          console.log('Slot selected:', slotInfo)
        }}
        />
      </div>
      
      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge 
                  className="text-white"
                  style={{ backgroundColor: getStatusColor(selectedEvent.status) }}
                >
                  {getStatusText(selectedEvent.status)}
                </Badge>
                <span className="text-sm text-gray-600">
                  {selectedEvent.university_details?.name}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDateTime(selectedEvent.start_datetime).full} - {formatDateTime(selectedEvent.end_datetime).full}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Timezone: Asia/Kolkata
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{selectedEvent.location}</span>
                </div>

                {selectedEvent.batch_details && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Batch: {selectedEvent.batch_details.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Description</h4>
                <p className="text-sm text-gray-600">{selectedEvent.description}</p>
              </div>

              {selectedEvent.notes && (
                <div className="space-y-2">
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedEvent.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Link href={`/events/${selectedEvent.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
