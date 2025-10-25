"use client"

import { PaymentLedger, LedgerFilters } from "@/types/ledger"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IndianRupee, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface LedgerTableProps {
  entries: PaymentLedger[]
  totalPages: number
  currentPage: number
  filters: LedgerFilters
}

function getTransactionTypeBadgeVariant(transactionType: string) {
  switch (transactionType) {
    case 'income':
    case 'refund':
      return 'default'
    case 'expense':
      return 'destructive'
    case 'oem_payment':
    case 'commission_payment':
      return 'secondary'
    case 'adjustment':
      return 'outline'
    default:
      return 'outline'
  }
}

function getTransactionTypeLabel(transactionType: string) {
  switch (transactionType) {
    case 'income':
      return 'Income'
    case 'expense':
      return 'Expense'
    case 'oem_payment':
      return 'OEM Payment'
    case 'commission_payment':
      return 'Commission'
    case 'refund':
      return 'Refund'
    case 'adjustment':
      return 'Adjustment'
    default:
      return transactionType
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function LedgerTable({ entries, totalPages, currentPage, filters }: LedgerTableProps) {
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value)
      }
    })
    
    if (page > 1) {
      params.set('page', page.toString())
    }
    
    const queryString = params.toString()
    window.location.href = `/ledger${queryString ? `?${queryString}` : ''}`
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No ledger entries</h3>
          <p className="mt-1 text-sm text-gray-500">
            No transactions found for the selected filters.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  University
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Balance
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm">
                    {formatDate(entry.transaction_date)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getTransactionTypeBadgeVariant(entry.transaction_type)}>
                      {getTransactionTypeLabel(entry.transaction_type)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="max-w-xs truncate" title={entry.description}>
                      {entry.description}
                    </div>
                    {entry.notes && (
                      <div className="text-xs text-muted-foreground mt-1 truncate" title={entry.notes}>
                        {entry.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {entry.university_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className={`flex items-center gap-1 font-medium ${
                      entry.transaction_type === 'income' || entry.transaction_type === 'refund'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      <IndianRupee className="h-4 w-4" />
                      {entry.amount.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1 font-medium">
                      <IndianRupee className="h-4 w-4" />
                      {entry.running_balance.toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {entry.reference_number || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
