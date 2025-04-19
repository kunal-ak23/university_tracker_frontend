import { getProgramBatch } from "@/service/api/program-batches"
import { getChannelPartnerStudents } from "@/service/api/channel-partner-students"
import { ProgramBatchStudents } from "@/components/program-batches/program-batch-students"
import { AddStudentDialog } from "@/components/program-batches/add-student-dialog"
import { notFound } from "next/navigation"

export default async function ProgramBatchPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>
}>) {
  const { id } = await params
  let programBatch
  let students

  try {
    const [programBatchData, studentsData] = await Promise.all([
      getProgramBatch(parseInt(id)),
      getChannelPartnerStudents({ program_batch: parseInt(id) })
    ])
    programBatch = programBatchData
    students = studentsData.results
  } catch (error) {
    console.error(error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Program Batch: {programBatch.name}</h2>
        <AddStudentDialog programBatchId={programBatch.id} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border p-6">
          <h3 className="text-lg font-medium mb-4">Batch Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Program:</span> {programBatch.program_details.name}</p>
            <p><span className="font-medium">Start Date:</span> {new Date(programBatch.start_date).toLocaleDateString()}</p>
            <p><span className="font-medium">End Date:</span> {new Date(programBatch.end_date).toLocaleDateString()}</p>
            <p><span className="font-medium">Number of Students:</span> {programBatch.number_of_students}</p>
            <p><span className="font-medium">Cost per Student:</span> {programBatch.cost_per_student ? `$${programBatch.cost_per_student}` : "-"}</p>
            <p><span className="font-medium">Status:</span> {programBatch.status}</p>
            {programBatch.notes && <p><span className="font-medium">Notes:</span> {programBatch.notes}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <h3 className="text-lg font-medium">Enrolled Students</h3>
        </div>
        <ProgramBatchStudents 
          programBatchId={programBatch.id} 
          initialStudents={students} 
        />
      </div>
    </div>
  )
} 