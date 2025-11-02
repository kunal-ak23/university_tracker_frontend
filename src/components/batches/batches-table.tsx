"use client"

import { useToast } from "@/hooks/use-toast"
import { DataTable } from "@/components/ui/data-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/service/utils"
import { Batch } from "@/types/batch"
import { ColumnDef, Row } from "@tanstack/react-table"
import { deleteBatch, getBatch } from "@/service/api/batches"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { buildUrlWithReturn } from "@/service/utils/navigation"

interface BatchesTableProps {
  batches: Batch[]
  streamId?: string
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onSearch?: (query: string) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  onDelete?: (batchId: number) => void
}

export function BatchesTable({ 
  batches,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onDelete,
}: BatchesTableProps) {
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleDelete = async (batchId: number) => {
    try {
      await deleteBatch(batchId.toString())
      toast({
        title: "Success",
        description: "Batch deleted successfully",
      })
      onDelete?.(batchId)
    } catch (error) {
      console.error("Failed to delete batch:", error)
      toast({
        title: "Error",
        description: "Failed to delete batch",
        variant: "destructive",
      })
    }
  }

  const handleDuplicate = async (batch: Batch) => {
    try {
      // Fetch full batch details if not already available
      let batchData = batch
      if (!batch.university || !batch.stream || typeof batch.university === 'number') {
        batchData = await getBatch(batch.id.toString())
      }
      
      // Build query params from batch data
      const params = new URLSearchParams()
      params.set('copyFrom', 'true')
      
      const universityId = typeof batchData.university === 'object' 
        ? batchData.university.id.toString() 
        : batchData.university?.toString() || ''
      const streamId = typeof batchData.stream === 'object' 
        ? batchData.stream.id.toString() 
        : batchData.stream?.toString() || ''
      const programId = typeof batchData.program === 'object' 
        ? batchData.program.id.toString() 
        : batchData.program?.toString() || ''
      
      params.set('university', universityId)
      params.set('stream', streamId)
      params.set('program', programId)
      params.set('name', batchData.name)
      params.set('number_of_students', batchData.number_of_students.toString())
      params.set('start_year', batchData.start_year.toString())
      params.set('end_year', batchData.end_year.toString())
      params.set('status', batchData.status || 'planned')
      if (batchData.start_date) params.set('start_date', batchData.start_date)
      if (batchData.end_date) params.set('end_date', batchData.end_date)
      if (batchData.notes) params.set('notes', batchData.notes)
      
      // Navigate to create page with copied values
      router.push(`/batches/new?${params.toString()}`)
    } catch (error) {
      console.error("Failed to duplicate batch:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to duplicate batch",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'planned':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const columns: ColumnDef<Batch, any>[] = [
    {
      id: "name",
      header: "Name",
      accessorFn: (row: Batch) => row.name,
      cell: ({ row }: { row: Row<Batch> }) => (
        <Link href={`/batches/${row.original.id}`} className="hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      id: "start_date",
      header: "Start Date",
      accessorFn: (row: Batch) => row.start_date,
      cell: ({ row }: { row: Row<Batch> }) => formatDate(row.original.start_date),
    },
    {
      id: "end_date",
      header: "End Date",
      accessorFn: (row: Batch) => row.end_date,
      cell: ({ row }: { row: Row<Batch> }) => formatDate(row.original.end_date),
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row: Batch) => row.status,
      cell: ({ row }: { row: Row<Batch> }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: Row<Batch> }) => {
        const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
        const editUrl = buildUrlWithReturn(`/batches/${row.original.id}/edit`, currentPath)
        
        return (
        <div className="flex items-center gap-2">
          <Link href={editUrl}>
            <Button variant="ghost" size="icon" title="Edit">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDuplicate(row.original)}
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        )
      },
    },
  ]

  return (
    <DataTable<Batch, any>
      data={batches}
      columns={columns}
      pageCount={totalPages}
      searchPlaceholder="Search batches..."
      hasNextPage={hasNextPage}
      hasPreviousPage={hasPreviousPage}
    />
  )
} 
