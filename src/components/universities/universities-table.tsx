"use client"

import { University } from "@/types/university"
import { DataTable } from "@/components/ui/data-table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { deleteUniversity } from "@/service/api/universities"
import { useToast } from "@/hooks/use-toast"
import { ColumnDef, Row } from "@tanstack/react-table"
import { buildUrlWithReturn } from "@/service/utils/navigation"

interface UniversitiesTableProps {
  universities: University[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  hasNextPage?: boolean
  hasPreviousPage?: boolean
  totalCount?: number
}

export function UniversitiesTable({ 
  universities,
  currentPage,
  totalPages,
  onPageChange,
  hasNextPage,
  hasPreviousPage,
  totalCount,
}: UniversitiesTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const handleDelete = async (id: string) => {
    try {
      await deleteUniversity(id)
      toast({
        title: "Success",
        description: "University deleted successfully",
      })
      router.refresh()
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to delete university",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<University, unknown>[] = [
    {
      id: "name",
      header: "Name",
      accessorFn: (row: University) => row.name,
      cell: ({ row }: { row: Row<University> }) => (
        <Link href={`/universities/${row.original.id}`} className="hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      id: "location",
      header: "Location",
      accessorFn: (row: University) => row.address,
      cell: ({ row }: { row: Row<University> }) => row.original.address,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: Row<University> }) => {
        const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
        const editUrl = buildUrlWithReturn(`/universities/${row.original.id}/edit`, currentPath)
        
        return (
        <div className="flex items-center gap-2">
          <Link href={editUrl}>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
        )
      },
    },
  ]

  return (
    <DataTable<University, unknown>
      data={universities}
      columns={columns}
      pageCount={totalPages}
      currentPage={currentPage}
      searchPlaceholder="Search universities..."
      hasNextPage={hasNextPage ?? currentPage < totalPages}
      hasPreviousPage={hasPreviousPage ?? currentPage > 1}
      onPageChange={onPageChange}
      totalCount={totalCount}
      pageSize={10}
    />
  )
}
