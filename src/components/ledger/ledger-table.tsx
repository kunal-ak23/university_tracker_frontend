"use client"

import { PaymentLedger, LedgerFilters, LedgerAccount } from "@/types/ledger"
import { Badge } from "@/components/ui/badge"
import { IndianRupee } from "lucide-react"
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { buildLedgerQuery } from "@/lib/ledger"

interface LedgerTableProps {
  entries: PaymentLedger[]
  totalPages: number
  currentPage: number
  filters: LedgerFilters
  view: "transactions" | "accounts"
}

function getAccountLabel(account: LedgerAccount) {
  const mapping: Record<LedgerAccount, string> = {
    cash: 'Cash',
    accounts_receivable: 'Accounts Receivable',
    oem_payable: 'OEM Payable',
    expense: 'Expense',
    commission_expense: 'Commission Expense',
    revenue: 'Revenue',
    tds_payable: 'TDS Payable',
  }
  return mapping[account] || account
}

function getAccountBadgeVariant(account: LedgerAccount) {
  switch (account) {
    case 'cash':
      return 'default'
    case 'accounts_receivable':
    case 'revenue':
      return 'secondary'
    case 'expense':
    case 'commission_expense':
      return 'destructive'
    case 'oem_payable':
    case 'tds_payable':
      return 'outline'
    default:
      return 'outline'
  }
}

function getEntryTypeLabel(entryType: string, reversing: boolean) {
  const base = entryType === 'DEBIT' ? 'Debit' : 'Credit'
  return reversing ? `${base} (Reversal)` : base
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function LedgerTable({ entries, totalPages, currentPage, filters, view }: LedgerTableProps) {
  const handlePageChange = (page: number) => {
    const queryString = buildLedgerQuery(
      { ...filters, page },
      { view }
    )
    window.location.href = `/ledger${queryString}`
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
                  Account
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
                  Entry Type
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
                    {formatDate(entry.entry_date)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getAccountBadgeVariant(entry.account)}>
                      {getAccountLabel(entry.account)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="max-w-xs truncate" title={entry.memo || undefined}>
                      {entry.memo || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {entry.university_name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className={`flex items-center gap-1 font-medium ${
                      entry.entry_type === 'DEBIT'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      <IndianRupee className="h-4 w-4" />
                      {entry.amount?.toLocaleString('en-IN') ?? '0'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={entry.reversing ? 'secondary' : 'outline'}>
                      {getEntryTypeLabel(entry.entry_type, entry.reversing)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {entry.payment_reference || entry.external_reference || '-'}
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
