import { getUniversityEvent } from "@/service/api/university-events"
import { notFound } from "next/navigation"
import { EventDetails } from "@/components/events/event-details"

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  let event
  try {
    event = await getUniversityEvent(parseInt(id))
  } catch (error) {
    console.error('Error fetching event:', error)
    notFound()
  }

  return <EventDetails initialEvent={event} />
} 
