import { ProgramBatchForm } from "@/components/program-batches/program-batch-form"

export default function NewProgramBatchPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">New Program Batch</h2>
      </div>

      <div className="rounded-md border p-6">
        <ProgramBatchForm />
      </div>
    </div>
  )
} 