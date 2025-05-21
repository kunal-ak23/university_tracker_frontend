import { getChannelPartnerStudent } from "@/service/api/channel-partner-students"
import { ChannelPartnerStudentForm } from "@/components/channel-partner-students/channel-partner-student-form"
import { notFound } from "next/navigation"

export default async function EditChannelPartnerStudentPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>
}>) {
  const { id } = await params
  let channelPartnerStudent

  try {
    channelPartnerStudent = await getChannelPartnerStudent(parseInt(id))
  } catch (error) {
    console.error(error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Student Enrollment</h2>
      </div>

      <div className="rounded-md border p-6">
        <ChannelPartnerStudentForm 
          mode="edit" 
          channelPartnerStudent={channelPartnerStudent} 
        />
      </div>
    </div>
  )
} 