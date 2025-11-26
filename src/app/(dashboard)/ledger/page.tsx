import Link from "next/link"

import { getLedgerEntries, getLedgerSummary, getLedgerTransactions } from "@/service/api/ledger"
import { getUniversities } from "@/service/api/universities"
import { LedgerFilters } from "@/types/ledger"
import { LedgerSummaryCard } from "@/components/ledger/ledger-summary-card"
import { LedgerFilters as LedgerFiltersComponent } from "@/components/ledger/ledger-filters"
import { LedgerTable } from "@/components/ledger/ledger-table"
import { LedgerTransactionsTable } from "@/components/ledger/ledger-transactions-table"
import { buildLedgerQuery } from "@/lib/ledger"

interface LedgerPageProps {
  searchParams: Promise<{
    university?: string
    start_date?: string
    end_date?: string
    account?: string
    entry_type?: string
    source?: string
    search?: string
    page?: string
    view?: string
  }>
}

export default async function LedgerPage({ searchParams }: LedgerPageProps) {
  const params = await searchParams
  const pageNumber = Number(params.page) || 1
  const view = params.view === 'accounts' ? 'accounts' : 'transactions'
  
  const filters: LedgerFilters = {
    university: params.university,
    start_date: params.start_date,
    end_date: params.end_date,
    account: params.account,
    entry_type: params.entry_type,
    source: params.source,
    search: params.search,
    page: pageNumber
  }

  const ledgerPromise = view === 'accounts' ? getLedgerEntries(filters) : Promise.resolve(null)
  const transactionsPromise = view === 'transactions' ? getLedgerTransactions(filters) : Promise.resolve(null)
  const universitiesPromise = getUniversities()
  
  const [ledgerResponse, transactionsResponse, universitiesResponse] = await Promise.all([
    ledgerPromise,
    transactionsPromise,
    universitiesPromise
  ])
  
  const universities = universitiesResponse.results
  
  const totalPages = view === 'accounts'
    ? Math.ceil((ledgerResponse?.count || 0) / 10)
    : Math.ceil((transactionsResponse?.count || 0) / 10)
  
  // Get summary if university is selected
  let summary = null
  if (params.university) {
    try {
      summary = await getLedgerSummary(
        params.university,
        params.start_date,
        params.end_date
      )
    } catch (error) {
      console.error('Failed to load ledger summary:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Financial Ledger</h2>
      </div>

      <LedgerFiltersComponent 
        universities={universities}
        initialFilters={filters}
        currentView={view}
      />

      <div className="flex items-center gap-4 border-b pb-2">
        <Link
          href={`/ledger${buildLedgerQuery({ ...filters, page: undefined }, { view: undefined })}`}
          className={`pb-2 text-sm font-medium border-b-2 ${
            view === 'transactions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          Transactions
        </Link>
        <Link
          href={`/ledger${buildLedgerQuery({ ...filters, page: undefined }, { view: 'accounts' })}`}
          className={`pb-2 text-sm font-medium border-b-2 ${
            view === 'accounts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
          }`}
        >
          Account Entries
        </Link>
      </div>

      {summary && (
        <LedgerSummaryCard summary={summary} />
      )}

      {view === 'transactions' && transactionsResponse && (
        <LedgerTransactionsTable
          entries={transactionsResponse.results}
          totalPages={totalPages || 1}
          currentPage={pageNumber}
          filters={filters}
        />
      )}

      {view === 'accounts' && ledgerResponse && (
        <div className="space-y-4">
          <AccountTabs currentAccount={filters.account || 'all'} filters={filters} />
          <LedgerTable 
            entries={ledgerResponse.results}
            totalPages={totalPages || 1}
            currentPage={pageNumber}
            filters={filters}
            view="accounts"
          />
        </div>
      )}
    </div>
  )
}

interface AccountTabsProps {
  currentAccount: string
  filters: LedgerFilters
}

function AccountTabs({ currentAccount, filters }: AccountTabsProps) {
  const tabs = [
    { label: "All Accounts", value: "all" },
    { label: "Cash", value: "cash" },
    { label: "Accounts Receivable", value: "accounts_receivable" },
    { label: "OEM Payable", value: "oem_payable" },
    { label: "Expense", value: "expense" },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          href={`/ledger${buildLedgerQuery(
            { ...filters, account: tab.value === 'all' ? undefined : tab.value, page: undefined },
            { view: 'accounts' }
          )}`}
          className={`px-3 py-1 rounded-full border text-sm ${
            currentAccount === tab.value
              ? 'border-primary text-primary bg-primary/10'
              : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}
