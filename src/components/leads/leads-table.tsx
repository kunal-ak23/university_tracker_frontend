"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Pencil, Trash, Search } from "lucide-react"
import { Lead, LeadStatus } from "@/types/lead"
import { deleteLead } from "@/service/api/leads"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"

const LEAD_STATUS_CHOICES: Record<LeadStatus, { label: string; color: string }> = {
  hot: { label: "Hot", color: "bg-red-500" },
  warm: { label: "Warm", color: "bg-orange-500" },
  cold: { label: "Cold", color: "bg-blue-500" },
  closed: { label: "Closed", color: "bg-gray-500" },
  converted: { label: "Converted", color: "bg-green-500" },
  lost: { label: "Lost", color: "bg-red-700" },
  not_interested: { label: "Not Interested", color: "bg-gray-700" },
}

interface LeadsTableProps {
  leads: Lead[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  onSort: (column: string, direction: 'asc' | 'desc') => void
  onDelete: (id: number) => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  hasNextPage: boolean
  hasPreviousPage: boolean
  totalCount: number
  statusFilter: LeadStatus | "all"
  onStatusFilterChange: (status: LeadStatus | "all") => void
}

export function LeadsTable({
  leads,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
  onSort,
  onDelete,
  sortColumn,
  sortDirection,
  hasNextPage,
  hasPreviousPage,
  totalCount,
  statusFilter,
  onStatusFilterChange,
}: LeadsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  console.log(leads);

  const handleDelete = async (id: number) => {
    try {
      setIsDeleting(id)
      await deleteLead(id)
      onDelete(id)
      toast({
        title: "Success",
        description: "Lead deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete lead:", error)
      toast({
        title: "Error",
        description: "Failed to delete lead",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </form>
        <Select
          value={statusFilter}
          onValueChange={(value) => onStatusFilterChange(value as LeadStatus | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(LEAD_STATUS_CHOICES).map(([value, { label }]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        {(!leads || !Array.isArray(leads) || leads.length === 0) ? (
          <div className="p-4 text-center text-muted-foreground">
            No leads found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <DataTableColumnHeader
                    title="Name"
                    column="name"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </TableHead>
                <TableHead>
                  <DataTableColumnHeader
                    title="Mobile"
                    column="mobile"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </TableHead>
                <TableHead>
                  <DataTableColumnHeader
                    title="Email"
                    column="email"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </TableHead>
                <TableHead>
                  <DataTableColumnHeader
                    title="Status"
                    column="status"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </TableHead>
                <TableHead>
                  <DataTableColumnHeader
                    title="Created By"
                    column="created_by"
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={onSort}
                  />
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.name}</TableCell>
                  <TableCell>{lead.mobile}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>
                    <Badge
                      className={LEAD_STATUS_CHOICES[lead.status].color}
                    >
                      {LEAD_STATUS_CHOICES[lead.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.agent_details.email}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => router.push(`/leads/${lead.id}/edit`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(lead.id)}
                          disabled={isDeleting === lead.id}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <DataTablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        totalCount={totalCount}
      />
    </div>
  )
} 