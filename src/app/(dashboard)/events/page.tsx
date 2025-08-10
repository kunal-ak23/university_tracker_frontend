import { getUniversityEvents } from "@/service/api/university-events"
import { getUniversities } from "@/service/api/universities"
import { UniversityEventForm } from "@/components/universities/university-event-form"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"
import { UniversityEvent } from "@/service/api/university-events"
import { University } from "@/types/university"
import Link from "next/link"

interface EventsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    university?: string
    page?: string
  }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { search, status, university, page } = await searchParams

  // Fetch events with filters
  let events: UniversityEvent[] = []
  let totalCount = 0
  try {
    const eventsResponse = await getUniversityEvents({
      search,
      status,
      university: university ? parseInt(university) : undefined,
      page: page ? parseInt(page) : 1,
      page_size: 20
    })
    events = eventsResponse.results || []
    totalCount = eventsResponse.count
  } catch (error) {
    console.error('Error fetching events:', error)
  }

  // Fetch universities for filter
  let universities: University[] = []
  try {
    const universitiesResponse = await getUniversities({ page_size: 100 })
    universities = universitiesResponse.results || []
  } catch (error) {
    console.error('Error fetching universities:', error)
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
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-gray-600">
            Manage university events and their approval workflow
          </p>
        </div>
        <UniversityEventForm 
          universityId={universities[0]?.id ? parseInt(universities[0].id.toString()) : 1}
          trigger={
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          }
        />
      </div>
      {/* Events List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            Events ({totalCount})
          </h3>
        </div>

        {events.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 text-center mb-4">
                Get started by creating your first event.
              </p>
              <UniversityEventForm 
                universityId={universities[0]?.id ? parseInt(universities[0].id.toString()) : 1}
                trigger={<Button>Create Event</Button>}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status.replace('_', ' ').charAt(0).toUpperCase() + event.status.replace('_', ' ').slice(1)}
                    </Badge>
                  </div>
                  <CardDescription>
                    {event.university_details?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {formatDateTime(event.start_datetime).date}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {formatDateTime(event.start_datetime).time} - {formatDateTime(event.end_datetime).time}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  </div>

                  {event.batch_details && (
                    <div className="text-sm text-gray-600">
                      Batch: {event.batch_details.name}
                    </div>
                  )}

                  <div className="pt-2">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 
