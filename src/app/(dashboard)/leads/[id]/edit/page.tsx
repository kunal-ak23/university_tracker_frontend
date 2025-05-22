import { getLead } from "@/service/api/leads"
import { LeadForm } from "@/components/leads/lead-form"
import { notFound } from "next/navigation"

interface EditLeadPageProps {
  params: {
    id: string
  }
}

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const { id } = params
  let lead

  try {
    lead = await getLead(parseInt(id))
  } catch (error) {
    console.error("Failed to fetch lead:", error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Lead</h2>
      </div>

      <div className="rounded-md border p-6">
        <LeadForm mode="edit" lead={lead} />
      </div>
    </div>
  )
} 