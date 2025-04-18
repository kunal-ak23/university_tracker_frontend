import { getStudent } from "@/service/api/students"
import { StudentForm } from "@/components/students/student-form"
import { notFound } from "next/navigation"

export default async function EditStudentPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>
}>) {
  const { id } = await params
  let student

  try {
    student = await getStudent(id)
  } catch (error) {
    console.error(error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Edit Student</h2>
      </div>
      <StudentForm mode="edit" student={student} />
    </div>
  )
} 