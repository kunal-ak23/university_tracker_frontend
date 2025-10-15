"use client"
import { useState } from 'react'
import { createExpense } from '@/service/api/expenses'
import { ExpenseCategory } from '@/types/expense'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { getUniversities } from '@/service/api/universities'
import { getContracts } from '@/service/api/contracts'
import { getBatches } from '@/service/api/batches'
import { getUniversityEvents, UniversityEvent } from '@/service/api/university-events'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ChevronsUpDown } from 'lucide-react'

const categories: ExpenseCategory[] = ['marketing', 'travel', 'operations', 'logistics', 'venue', 'speaker', 'other']

export function ExpenseForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    university: '',
    batch: '',
    event: '',
    category: 'other' as ExpenseCategory,
    amount: '',
    incurred_date: '',
    description: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [universities, setUniversities] = useState<{ id: number; name: string }[]>([])
  const [batches, setBatches] = useState<{ id: number; name: string }[]>([])
  const [events, setEvents] = useState<{ id: number; title: string }[]>([])
  const [batchOpen, setBatchOpen] = useState(false)
  const [eventOpen, setEventOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await getUniversities({ page_size: 100, ordering: 'name' })
      setUniversities(res.results.map(u => ({ id: (u as any).id, name: (u as any).name })))
    }
    load()
  }, [])

  // Load batches and events when university changes
  useEffect(() => {
    async function loadRelated() {
      setBatches([])
      setEvents([])
      setForm(prev => ({ ...prev, batch: '', event: '' }))
      const uniId = form.university ? Number(form.university) : null
      if (!uniId) return

      // Load contracts for university, then batches for each contract
      const contracts = await getContracts({ university: uniId, page_size: 100 })
      const batchLists = await Promise.all(
        contracts.results.map(c => getBatches(`/batches/?contract=${(c as any).id}&page_size=100`))
      )
      const mergedBatches: { id: number; name: string }[] = []
      batchLists.forEach(r => {
        r.results.forEach(b => mergedBatches.push({ id: (b as any).id, name: (b as any).name }))
      })
      setBatches(mergedBatches)

      // Load events for university
      const evts = await getUniversityEvents({ university: uniId, page_size: 100 })
      setEvents(evts.results.map(e => ({ id: e.id, title: e.title })))
    }
    loadRelated()
  }, [form.university])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createExpense({
        university: Number(form.university),
        batch: form.batch ? Number(form.batch) : null,
        event: form.event ? Number(form.event) : null,
        category: form.category,
        amount: form.amount ? form.amount : undefined,
        incurred_date: form.incurred_date,
        description: form.description || undefined,
        notes: form.notes || undefined,
      })
      router.push('/expenses')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
      <div>
        <Label>University</Label>
        <Select value={form.university} onValueChange={(v) => setForm({ ...form, university: v })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a university" />
          </SelectTrigger>
          <SelectContent>
            {universities.map(u => (
              <SelectItem key={u.id} value={String(u.id)}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Batch (optional)</Label>
          <Popover open={batchOpen} onOpenChange={setBatchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={batchOpen} className="w-full justify-between">
                {form.batch ? (batches.find(b => String(b.id) === form.batch)?.name || 'Select a batch') : (batches.length ? 'Select a batch' : 'Select university first')}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search batch..." />
                <CommandEmpty>No batch found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {batches.map((b) => (
                      <CommandItem
                        key={b.id}
                        value={b.name}
                        onSelect={() => {
                          setForm({ ...form, batch: String(b.id) })
                          setBatchOpen(false)
                        }}
                      >
                        {b.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label>Event (optional)</Label>
          <Popover open={eventOpen} onOpenChange={setEventOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={eventOpen} className="w-full justify-between">
                {form.event ? (events.find(e => String(e.id) === form.event)?.title || 'Select an event') : (events.length ? 'Select an event' : 'Select university first')}
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search event..." />
                <CommandEmpty>No event found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {events.map((ev) => (
                      <CommandItem
                        key={ev.id}
                        value={ev.title}
                        onSelect={() => {
                          setForm({ ...form, event: String(ev.id) })
                          setEventOpen(false)
                        }}
                      >
                        {ev.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ExpenseCategory })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Amount</Label>
          <Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
        </div>
      </div>
      <div>
        <Label>Date</Label>
        <Input type="date" value={form.incurred_date} onChange={e => setForm({ ...form, incurred_date: e.target.value })} required />
      </div>
      <div>
        <Label>Description</Label>
        <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </div>
      <div>
        <Label>Notes</Label>
        <Input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
      </div>
      <Button type="submit" disabled={submitting}>{submitting ? 'Saving...' : 'Save Expense'}</Button>
    </form>
  )
}


