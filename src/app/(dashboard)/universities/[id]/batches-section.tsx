"use client"

import { useState, useEffect } from "react"
import { Suspense } from "react"
import { getBatches } from "@/service/api/batches-client"
import { BatchesTable } from "@/components/batches/batches-table"
import { Batch } from "@/types/batch"
import { AddBatchDialogWrapper } from "./add-batch-dialog-wrapper"
import { useToast } from "@/hooks/use-toast"

interface UniversityBatchesSectionProps {
  universityId: number
}

export function UniversityBatchesSection({ universityId }: UniversityBatchesSectionProps) {
  const { toast } = useToast()
  const [batches, setBatches] = useState<Batch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState<string>()
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchBatches = async (
    page: number, 
    search?: string,
    ordering?: string
  ) => {
    try {
      setIsLoading(true)
      const response = await getBatches(`/batches/?university=${universityId}&page=${page}${search ? `&search=${search}` : ''}${ordering ? `&ordering=${ordering}` : ''}`)
      setBatches(response.results)
      setTotalCount(response.count)
      setTotalPages(Math.ceil(response.count / 25))
    } catch (error) {
      console.error('Failed to fetch batches:', error)
      toast({
        title: "Error",
        description: "Failed to load batches",
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
    fetchBatches(currentPage, searchQuery, ordering)
  }, [currentPage, searchQuery, sortColumn, sortDirection, universityId, refreshTrigger])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
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
    setBatches(batches.filter((batch) => batch.id !== id))
    fetchBatches(currentPage, searchQuery, sortColumn)
  }

  const handleBatchAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  if (isLoading && batches.length === 0) {
    return <div className="flex items-center justify-center h-24">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Batches</h3>
        <AddBatchDialogWrapper 
          universityId={universityId}
          onBatchAdded={handleBatchAdded}
        />
      </div>
      <Suspense fallback={<div className="flex items-center justify-center h-24">Loading...</div>}>
        <BatchesTable 
          batches={batches}
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
        />
      </Suspense>
    </div>
  )
}

