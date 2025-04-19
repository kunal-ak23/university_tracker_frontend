"use client"

import { ChannelPartnerStudent } from "@/types/channel-partner-student"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/service/utils"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { deleteChannelPartnerStudent } from "@/service/api/channel-partner-students"
import { useToast } from "@/hooks/use-toast"

interface ChannelPartnerStudentsTableProps {
  students: ChannelPartnerStudent[]
  onDelete?: (id: number) => void
}

export function ChannelPartnerStudentsTable({ students, onDelete }: ChannelPartnerStudentsTableProps) {
  const router = useRouter()
  const { toast } = useToast()

  console.log(students);

  const handleDelete = async (id: number) => {
    try {
      await deleteChannelPartnerStudent(id)
      toast({
        title: "Success",
        description: "Student enrollment deleted successfully",
      })
      onDelete?.(id)
    } catch (error) {
      console.error("Failed to delete student enrollment:", error)
      toast({
        title: "Error",
        description: "Failed to delete student enrollment",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "enrolled":
        return <Badge variant="default">Enrolled</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      case "dropped":
        return <Badge variant="destructive">Dropped</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Program Batch</TableHead>
          <TableHead>Channel Partner</TableHead>
          <TableHead>Transfer Price</TableHead>
          <TableHead>Commission Rate</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell className="font-medium">{student.student_details.name}</TableCell>
            <TableCell>{student.program_batch_details.name}</TableCell>
            <TableCell>{student.channel_partner_details.name}</TableCell>
            <TableCell>{formatCurrency(student.transfer_price)}</TableCell>
            <TableCell>{student.commission_rate}%</TableCell>
            <TableCell>{getStatusBadge(student.status)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/channel-partner-students/${student.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(student.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
} 
