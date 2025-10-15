import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ExpensesTable } from './table'

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
        <Link href="/expenses/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </Link>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center h-24">Loading...</div>}>
        <ExpensesTable />
      </Suspense>
    </div>
  )
}


