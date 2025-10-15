"use client"
import { useEffect, useState } from 'react'
import { getProfitability, getQuarterlyExpenses, ProfitabilityItem, QuarterlyItem } from '@/service/api/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function ReportsPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear())
  const [university, setUniversity] = useState<string>('')
  const [batch, setBatch] = useState<string>('')
  const [expenses, setExpenses] = useState<QuarterlyItem[]>([])
  const [profit, setProfit] = useState<ProfitabilityItem[]>([])

  useEffect(() => {
    async function load() {
      const exp = await getQuarterlyExpenses({ year, university: university ? Number(university) : undefined, batch: batch ? Number(batch) : undefined })
      setExpenses(exp.quarters)
      const prof = await getProfitability({ year, university: university ? Number(university) : undefined, batch: batch ? Number(batch) : undefined })
      setProfit(prof.quarters)
    }
    load()
  }, [year, university, batch])

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm">Year</label>
          <Input type="number" value={year} onChange={e => setYear(Number(e.target.value))} />
        </div>
        <div>
          <label className="text-sm">University ID (optional)</label>
          <Input value={university} onChange={e => setUniversity(e.target.value)} />
        </div>
        <div>
          <label className="text-sm">Batch ID (optional)</label>
          <Input value={batch} onChange={e => setBatch(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quarterly Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {expenses.map(q => (
                <div key={q.name} className="p-3 border rounded-md text-center">
                  <div className="text-sm text-muted-foreground">{q.name}</div>
                  <div className="text-xl font-semibold">₹{q.total.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quarterly Profitability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {profit.map(q => (
                <div key={q.name} className="p-3 border rounded-md">
                  <div className="text-sm text-muted-foreground mb-2">{q.name}</div>
                  <div className="text-sm">Revenue: <span className="font-medium">₹{q.revenue.toLocaleString()}</span></div>
                  <div className="text-sm">Expenses: <span className="font-medium">₹{q.expenses.toLocaleString()}</span></div>
                  <div className="text-sm">Profit: <span className="font-medium">₹{q.profit.toLocaleString()}</span></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


