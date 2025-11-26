"use client"

import { LedgerFilters, LedgerTransaction } from "@/types/ledger"
import { IndianRupee } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { buildLedgerQuery } from "@/lib/ledger"

interface LedgerTransactionsTableProps {
  entries: LedgerTransaction[]
  totalPages: number
  currentPage: number
  filters: LedgerFilters
}

const SOURCE_LABELS: Record<string, string> = {
  payment: "Payment",
  oem_payment: "OEM Payment",
  expense: "Expense",
  invoice: "Invoice",
  ledger_line: "Ledger Entry",
}

export function LedgerTransactionsTable({
  entries,
  totalPages,
  currentPage,
  filters,
}: LedgerTransactionsTableProps) {
  const handlePageChange = (page: number) => {
    const queryString = buildLedgerQuery(
      { ...filters, page },
      { view: "transactions" }
    )
    window.location.href = `/ledger${queryString}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8">
        <div className="text-center">
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No transactions</h3>
          <p className="mt-1 text-sm text-gray-500">
            No transactions found for the selected filters.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Date
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Description
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                University
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Cash In
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Cash Out
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Account Impact
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Source
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Reference
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-muted/50">
                <td className="px-4 py-3 text-sm">
                  {formatDate(transaction.date)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium truncate max-w-xs" title={transaction.description}>
                      {transaction.description}
                    </span>
                    {transaction.memo && (
                      <span className="text-xs text-muted-foreground truncate max-w-xs" title={transaction.memo}>
                        {transaction.memo}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {transaction.university_name || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                  {transaction.cash_in > 0 ? (
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {formatCurrency(transaction.cash_in)}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-red-600 font-semibold">
                  {transaction.cash_out > 0 ? (
                    <div className="flex items-center gap-1">
                      <IndianRupee className="h-4 w-4" />
                      {formatCurrency(transaction.cash_out)}
                    </div>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    {transaction.accounts_receivable_delta !== 0 && (
                      <Badge variant="outline">
                        AR: {transaction.accounts_receivable_delta > 0 ? "+" : "-"}
                        {formatCurrency(Math.abs(transaction.accounts_receivable_delta))}
                      </Badge>
                    )}
                    {transaction.oem_payable_delta !== 0 && (
                      <Badge variant="outline">
                        OEM: {transaction.oem_payable_delta > 0 ? "+" : "-"}
                        {formatCurrency(Math.abs(transaction.oem_payable_delta))}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant="secondary">
                    {SOURCE_LABELS[transaction.source_type] || transaction.source_type}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {transaction.references.length > 0 ? transaction.references.join(", ") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

