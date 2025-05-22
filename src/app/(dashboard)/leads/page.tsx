"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getLeads } from "@/service/api/leads"
import { LeadsTable } from "@/components/leads/leads-table"
import { Lead, LeadStatus } from "@/types/lead"
import Link from "next/link"

export default function LeadsPage() {
  const { toast } = useToast()
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all")
  const [sortColumn, setSortColumn] = useState<string>()
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>()

  const fetchLeads = async (
    page: number, 
    search?: string,
    ordering?: string,
    status?: LeadStatus
  ) => {
    try {
      setIsLoading(true)
      const response = await getLeads({ 
        page, 
        search,
        ordering,
        status: status !== "all" ? status : undefined,
        page_size: 25
      })
      setLeads(response.results)
      setTotalCount(response.count)
      setTotalPages(Math.ceil(response.count / 25))
    } catch (error) {
      console.error('Failed to fetch leads:', error)
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const ordering = sortColumn 
      ? `${sortDirection === 'desc' ? '-' : ''}${sortColumn}`
      : undefined
    fetchLeads(currentPage, searchQuery, ordering, statusFilter)
  }, [currentPage, searchQuery, sortColumn, sortDirection, statusFilter, toast])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleStatusFilter = (status: LeadStatus | "all") => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDelete = async (id: number) => {
    setLeads(leads.filter((lead) => lead.id !== id))
    fetchLeads(currentPage, searchQuery, sortColumn, statusFilter)
  }

  if (isLoading && leads.length === 0) {
    return <div className="flex items-center justify-center h-24">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
        <Button asChild>
          <Link href="/leads/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Link>
        </Button>
      </div>

      <LeadsTable 
        leads={leads}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onSort={handleSort}
        onDelete={handleDelete}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        hasNextPage={currentPage < totalPages}
        hasPreviousPage={currentPage > 1}
        totalCount={totalCount}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilter}
      />
    </div>
  )
} 
