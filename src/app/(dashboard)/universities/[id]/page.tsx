import { getUniversity } from "@/service/api/universities"
import { getStreamsByUniversity } from "@/service/api/streams"
import { getUniversityEvents } from "@/service/api/university-events"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ExternalLink, Plus, Calendar, Clock } from "lucide-react"
import { UniversityActions } from "@/components/universities/university-actions"
import { UniversityEventForm } from "@/components/universities/university-event-form"
import { UniversityLedgerCard } from "@/components/universities/university-ledger-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { University } from "@/types/university"
import { Stream } from "@/types/stream"
import { UniversityEvent } from "@/service/api/university-events"
import { UniversityBatchesSection } from "./batches-section"

export default async function UniversityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // First try to fetch the university
  let university: University
  try {
    university = await getUniversity(id)
  } catch (error) {
    console.error('Error fetching university:', error)
    notFound()
  }

  // Then try to fetch streams
  let streams: Stream[] = []
  try {
    const streamResponse = await getStreamsByUniversity(id)
    streams = streamResponse.results || []
  } catch (error) {
    console.error('Error fetching streams:', error)
  }


  // Fetch university events
  let events: UniversityEvent[] = []
  try {
    const eventsResponse = await getUniversityEvents({ university: parseInt(id) })
    events = eventsResponse.results || []
  } catch (error) {
    console.error('Error fetching events:', error)
  }

  const getEventStatusColor = (status: string) => {
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


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{university.name}</h2>
        <div className="flex gap-4">
          <UniversityEventForm 
            universityId={parseInt(id)} 
            batches={[]}
          />
          <UniversityActions universityId={id} />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <h4 className="font-medium">Total Streams</h4>
          </div>
          <p className="text-2xl font-bold">{streams.length}</p>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <h4 className="font-medium">Total Events</h4>
          </div>
          <p className="text-2xl font-bold">{events.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">Contact Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Email</dt>
              <dd>{university.contact_email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Phone</dt>
              <dd>{university.contact_phone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Website</dt>
              <dd>
                <Link 
                  href={university.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:underline"
                >
                  {university.website}
                  <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">Institution Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Established Year</dt>
              <dd>{university.established_year}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Accreditation</dt>
              <dd>{university.accreditation}</dd>
            </div>
          </dl>
        </div>

        <div className="col-span-2 rounded-lg border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Streams</h3>
            <Link href={`/universities/${id}/streams/new`}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Stream
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {streams.map((stream) => (
              <div key={stream.id} className="rounded-lg border p-4 space-y-2">
                <h4 className="font-semibold">{stream.name}</h4>
                <p className="text-sm text-gray-600">
                  Duration: {stream.duration} {stream.duration_unit}
                </p>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {stream.description || "No description provided"}
                </p>
                <div className="flex justify-end">
                  <Link href={`/universities/${id}/streams/${stream.id}`}>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </Link>
                </div>
              </div>
            ))}
            {streams.length === 0 && (
              <p className="col-span-3 text-center text-gray-600">
                No streams found. Click &quot;Add Stream&quot; to create one.
              </p>
            )}
          </div>
        </div>

        <div className="col-span-2 rounded-lg border p-6 space-y-6">
          <UniversityBatchesSection universityId={parseInt(id)} />
        </div>

        <div className="col-span-2 rounded-lg border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Events</h3>
            <UniversityEventForm 
              universityId={parseInt(id)} 
              batches={[]}
            />
          </div>
          {events.length === 0 ? (
            <p className="text-center text-gray-600">
              No events found. Click "Add Event" to create one.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {events.map((event) => (
                <div key={event.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold line-clamp-2">{event.title}</h4>
                    <Badge className={getEventStatusColor(event.status)}>
                      {event.status.replace('_', ' ').charAt(0).toUpperCase() + event.status.replace('_', ' ').slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.start_datetime).toLocaleDateString()} - {new Date(event.end_datetime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {new Date(event.start_datetime).toLocaleTimeString()} - {new Date(event.end_datetime).toLocaleTimeString()}
                    </div>
                    <p className="text-sm text-gray-600">
                      📍 {event.location}
                    </p>
                    {event.batch_details && (
                      <p className="text-sm text-gray-600">
                        Batch: {event.batch_details.name}
                      </p>
                    )}
                  </div>
                  {event.notes && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      📝 {event.notes}
                    </p>
                  )}
                  <div className="pt-2">
                    <Link href={`/events/${event.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-span-2 rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">Address</h3>
          <p className="whitespace-pre-line">{university.address}</p>
        </div>

        {/* Ledger Card */}
        <UniversityLedgerCard universityId={id} />
      </div>
    </div>
  )
}
