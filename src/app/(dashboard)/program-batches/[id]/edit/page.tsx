import { getProgramBatch } from "@/service/api/program-batches"
import { ProgramBatchForm } from "@/components/program-batches/program-batch-form"
import { notFound } from "next/navigation"

export default async function EditProgramBatchPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>
}>) {
  const { id } = await params
  let programBatch

  try {
    programBatch = await getProgramBatch(parseInt(id))
  } catch (error) {
    console.error(error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Program Batch</h2>
      </div>

      <div className="rounded-md border p-6">
        <ProgramBatchForm mode="edit" programBatch={programBatch} />
      </div>
    </div>
  )
} 