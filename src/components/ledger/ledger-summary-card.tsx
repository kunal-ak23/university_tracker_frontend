"use client"

import { LedgerSummary } from "@/types/ledger"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IndianRupee, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface LedgerSummaryCardProps {
  summary: LedgerSummary
}

export function LedgerSummaryCard({ summary }: LedgerSummaryCardProps) {
  const isProfit = summary.profit_loss >= 0
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            <IndianRupee className="inline h-5 w-5" />
            {summary.income.total.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Payments: <IndianRupee className="inline h-3 w-3" />
            {summary.income.payments_received.toLocaleString('en-IN')} • 
            Refunds: <IndianRupee className="inline h-3 w-3" />
            {summary.income.refunds.toLocaleString('en-IN')}
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            <IndianRupee className="inline h-5 w-5" />
            {summary.expenses.total.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Operational: <IndianRupee className="inline h-3 w-3" />
            {summary.expenses.operational_expenses.toLocaleString('en-IN')} • 
            OEM: <IndianRupee className="inline h-3 w-3" />
            {summary.expenses.oem_payments.toLocaleString('en-IN')}
          </div>
        </CardContent>
      </Card>

      {/* Profit/Loss */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
            <IndianRupee className="inline h-5 w-5" />
            {Math.abs(summary.profit_loss).toLocaleString('en-IN')}
          </div>
          <Badge variant={isProfit ? "default" : "destructive"} className="mt-1">
            {isProfit ? "Profit" : "Loss"}
          </Badge>
        </CardContent>
      </Card>

      {/* Transaction Count */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {summary.transaction_count}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total entries in period
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
