"use client"

import { ChannelPartnerStudent } from "@/types/channel-partner-student"
import { ChannelPartnerStudentsTable } from "@/components/channel-partner-students/channel-partner-students-table"
import { useState } from "react"

interface ProgramBatchStudentsProps {
  programBatchId: number
  initialStudents: ChannelPartnerStudent[]
}

export function ProgramBatchStudents({ programBatchId, initialStudents }: ProgramBatchStudentsProps) {
  const [students, setStudents] = useState<ChannelPartnerStudent[]>(initialStudents)

  const handleStudentDeleted = (id: number) => {
    setStudents(prev => prev.filter(student => student.id !== id))
  }

  return (
    <ChannelPartnerStudentsTable 
      students={students} 
      onDelete={handleStudentDeleted} 
    />
  )
} 