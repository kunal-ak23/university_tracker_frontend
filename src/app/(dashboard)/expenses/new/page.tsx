import { ExpenseForm } from './form'

export default function NewExpensePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Add Expense</h2>
      <ExpenseForm />
    </div>
  )
}


