import { getLedgerEntries, getLedgerSummary } from "@/service/api/ledger"
import { getUniversities } from "@/service/api/universities"
import { LedgerFilters } from "@/types/ledger"
import { University } from "@/types/university"
import { LedgerSummaryCard } from "@/components/ledger/ledger-summary-card"
import { LedgerFilters as LedgerFiltersComponent } from "@/components/ledger/ledger-filters"
import { LedgerTable } from "@/components/ledger/ledger-table"

interface LedgerPageProps {
  searchParams: Promise<{
    university?: string
    start_date?: string
    end_date?: string
    transaction_type?: string
    search?: string
    page?: string
  }>
}

export default async function LedgerPage({ searchParams }: LedgerPageProps) {
  const params = await searchParams
  const pageNumber = Number(params.page) || 1
  
  const filters: LedgerFilters = {
    university: params.university,
    start_date: params.start_date,
    end_date: params.end_date,
    transaction_type: params.transaction_type,
    search: params.search,
    page: pageNumber
  }
  
  const [ledgerResponse, universitiesResponse] = await Promise.all([
    getLedgerEntries(filters),
    getUniversities()
  ])
  
  const universities = universitiesResponse.results
  
  const totalPages = Math.ceil(ledgerResponse.count / 10)
  
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
      />

      {summary && (
        <LedgerSummaryCard summary={summary} />
      )}

      <LedgerTable 
        entries={ledgerResponse.results}
        totalPages={totalPages}
        currentPage={pageNumber}
        filters={filters}
      />
    </div>
  )
}
