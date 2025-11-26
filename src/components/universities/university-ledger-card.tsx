"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { IndianRupee, TrendingUp, TrendingDown, Eye, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { getLedgerEntries, getLedgerSummary } from "@/service/api/ledger"
import type { PaymentLedger, LedgerSummary, LedgerAccount } from "@/types/ledger"

interface UniversityLedgerCardProps {
  universityId: string
}

export function UniversityLedgerCard({ universityId }: UniversityLedgerCardProps) {
  const router = useRouter()
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current_year")
  const [ledgerSummary, setLedgerSummary] = useState<LedgerSummary | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<PaymentLedger[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLedgerData()
  }, [selectedPeriod])

  const loadLedgerData = async () => {
    setLoading(true)
    try {
      const { startDate, endDate } = getDateRange(selectedPeriod)
      
      // Fetch summary
      const summary = await getLedgerSummary(
        universityId.toString(),
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
      setLedgerSummary(summary)

      // Fetch recent 5 transactions
      const transactions = await getLedgerEntries({
        university: universityId.toString(),
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        page: 1,
      })
      setRecentTransactions(transactions.results || [])
    } catch (error) {
      console.error("Failed to load ledger data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = (period: string): { startDate: Date; endDate: Date } => {
    const today = new Date()
    const currentYear = today.getFullYear()
    
    switch (period) {
      case "current_year":
        return {
          startDate: new Date(currentYear, 0, 1),
          endDate: new Date(currentYear, 11, 31),
        }
      case "current_fy": // Financial Year (April to March)
        const fyStart = new Date(currentYear, 3, 1) // April 1
        const fyEnd = today < fyStart
          ? new Date(currentYear - 1, 11, 31) // Still in previous FY
          : new Date(currentYear + 1, 2, 31) // March 31 next year
        return {
          startDate: today < fyStart ? new Date(currentYear - 1, 3, 1) : fyStart,
          endDate: fyEnd,
        }
      case "q1":
        return {
          startDate: new Date(currentYear, 0, 1),
          endDate: new Date(currentYear, 2, 31),
        }
      case "q2":
        return {
          startDate: new Date(currentYear, 3, 1),
          endDate: new Date(currentYear, 5, 30),
        }
      case "q3":
        return {
          startDate: new Date(currentYear, 6, 1),
          endDate: new Date(currentYear, 8, 30),
        }
      case "q4":
        return {
          startDate: new Date(currentYear, 9, 1),
          endDate: new Date(currentYear, 11, 31),
        }
      default:
        return {
          startDate: new Date(currentYear, 0, 1),
          endDate: new Date(currentYear, 11, 31),
        }
    }
  }

  const getPeriodLabel = (period: string): string => {
    switch (period) {
      case "current_year":
        return "This Year"
      case "current_fy":
        return "Financial Year (Apr-Mar)"
      case "q1":
        return "Q1 (Jan-Mar)"
      case "q2":
        return "Q2 (Apr-Jun)"
      case "q3":
        return "Q3 (Jul-Sep)"
      case "q4":
        return "Q4 (Oct-Dec)"
      default:
        return "This Year"
    }
  }

  const formatCurrency = (amount: number): string => {
    return `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getEntryColor = (entry: PaymentLedger): string => {
    return entry.entry_type === 'DEBIT' ? 'text-green-600' : 'text-red-600'
  }

  const getAccountLabel = (account: LedgerAccount) => {
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-600">Loading...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Financial Overview</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[200px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_year">This Year</SelectItem>
                <SelectItem value="current_fy">Financial Year</SelectItem>
                <SelectItem value="q1">Q1 (Jan-Mar)</SelectItem>
                <SelectItem value="q2">Q2 (Apr-Jun)</SelectItem>
                <SelectItem value="q3">Q3 (Jul-Sep)</SelectItem>
                <SelectItem value="q4">Q4 (Oct-Dec)</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/ledger?university=${universityId}&period=${selectedPeriod}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Full Ledger
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        {ledgerSummary && (
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <h4 className="font-medium">Total Income</h4>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(ledgerSummary.income?.total || 0)}
              </p>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <h4 className="font-medium">Total Expenses</h4>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(ledgerSummary.expenses?.total || 0)}
              </p>
            </div>
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <IndianRupee className="h-4 w-4" />
                <h4 className="font-medium">Net Profit/Loss</h4>
              </div>
              <p className={`text-2xl font-bold ${
                (ledgerSummary.profit_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(ledgerSummary.profit_loss || 0)}
              </p>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Recent Transactions (Last 5)</h4>
            <Badge variant="secondary">{getPeriodLabel(selectedPeriod)}</Badge>
          </div>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-600">
              <p>No transactions found for this period</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {getAccountLabel(transaction.account)}
                      </Badge>
                      <span className="text-sm font-medium">
                        {transaction.memo || '—'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {format(new Date(transaction.entry_date), "MMM dd, yyyy")}
                      {(transaction.payment_reference || transaction.external_reference) && (
                        <span className="ml-2">
                          • Ref: {transaction.payment_reference || transaction.external_reference}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`font-semibold ${getEntryColor(transaction)}`}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

