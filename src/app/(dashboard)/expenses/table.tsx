"use client"
import { useEffect, useState } from 'react'
import { getExpenses } from '@/service/api/expenses'
import { Expense } from '@/types/expense'
import { DataTable } from '@/components/ui/data-table'

export function ExpensesTable() {
  const [data, setData] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await getExpenses({ page_size: 50, ordering: '-incurred_date' })
        setData(res.results)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="flex items-center justify-center h-24">Loading...</div>

  return (
    <div className="rounded-md border">
      <DataTable
        data={data}
        columns={[
          { header: 'Date', accessorKey: 'incurred_date' },
          { header: 'Category', accessorKey: 'category' },
          { header: 'Amount', accessorKey: 'amount' },
          { header: 'University', accessorKey: 'university_details.name' },
          { header: 'Batch', accessorKey: 'batch_details.name' },
          { header: 'Event', accessorKey: 'event_details.title' },
        ] as any}
        searchColumnKey="category"
        searchPlaceholder="Filter by category"
      />
    </div>
  )
}


