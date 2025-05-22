import { LeadForm } from "@/components/leads/lead-form"

export default function NewLeadPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">New Lead</h2>
      </div>

      <div className="rounded-md border p-6">
        <LeadForm mode="create" />
      </div>
    </div>
  )
} 