"use client"

import { useState, useEffect } from "react"
import { Suspense } from "react"
import { getInvoices } from "@/service/api/invoices"
import { Invoice } from "@/types/payment"
import { InvoicesTable } from "@/components/invoices/invoices-table"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { buildUrlWithReturn } from "@/service/utils/navigation"
import { usePathname, useSearchParams } from "next/navigation"

interface BillingInvoicesSectionProps {
  billingId: string
}

export function BillingInvoicesSection({ billingId }: BillingInvoicesSectionProps) {
  const { toast } = useToast()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState<string>()
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>()
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const fetchInvoices = async (
    page: number, 
    search?: string,
    ordering?: string
  ) => {
    try {
      setIsLoading(true)
      const response = await getInvoices({ 
        page, 
        search, 
        ordering,
        billing: parseInt(billingId),
        page_size: 25
      })
      setInvoices(response.results)
      setTotalCount(response.count)
      setTotalPages(Math.ceil(response.count / 25))
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      toast({
        title: "Error",
        description: "Failed to load invoices",
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
    fetchInvoices(currentPage, searchQuery, ordering)
  }, [currentPage, searchQuery, sortColumn, sortDirection, billingId, refreshTrigger])

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
    setInvoices(invoices.filter((invoice) => invoice.id !== id))
    fetchInvoices(currentPage, searchQuery, sortColumn)
  }

  const handleInvoiceAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const currentPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
  const newInvoiceUrl = buildUrlWithReturn(`/invoices/new?billing=${billingId}`, currentPath)

  if (isLoading && invoices.length === 0) {
    return <div className="flex items-center justify-center h-24">Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Invoices</h3>
        <Link href={newInvoiceUrl}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Invoice
          </Button>
        </Link>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center h-24">Loading...</div>}>
        <InvoicesTable 
          invoices={invoices}
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

