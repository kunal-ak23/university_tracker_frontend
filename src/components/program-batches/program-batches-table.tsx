"use client"

import { ProgramBatch } from "@/types/program-batch"
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
import { deleteProgramBatch } from "@/service/api/program-batches"
import { useToast } from "@/hooks/use-toast"

interface ProgramBatchesTableProps {
  programBatches: ProgramBatch[]
  onDelete?: (id: number) => void
}

export function ProgramBatchesTable({ programBatches, onDelete }: ProgramBatchesTableProps) {
  const router = useRouter()
  const { toast } = useToast()

  console.log(programBatches);

  const handleDelete = async (id: number) => {
    try {
      await deleteProgramBatch(id)
      toast({
        title: "Success",
        description: "Program batch deleted successfully",
      })
      onDelete?.(id)
    } catch (error) {
      console.error("Failed to delete program batch:", error)
      toast({
        title: "Error",
        description: "Failed to delete program batch",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "planned":
        return <Badge variant="outline">Planned</Badge>
      case "active":
        return <Badge variant="default">Active</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Program</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Cost/Student</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {programBatches.map((batch) => (
          <TableRow key={batch.id}>
            <TableCell className="font-medium">{batch.name}</TableCell>
            <TableCell>{batch.program_details.name}</TableCell>
            <TableCell>{format(new Date(batch.start_date), "MMM d, yyyy")}</TableCell>
            <TableCell>{format(new Date(batch.end_date), "MMM d, yyyy")}</TableCell>
            <TableCell>{batch.number_of_students}</TableCell>
            <TableCell>
              {batch.cost_per_student ? formatCurrency(batch.cost_per_student) : "-"}
            </TableCell>
            <TableCell>{getStatusBadge(batch.status)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push(`/program-batches/${batch.id}/edit`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(batch.id)}
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
