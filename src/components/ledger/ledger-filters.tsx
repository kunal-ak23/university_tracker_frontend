"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { University } from "@/types/university"
import { LedgerFilters as LedgerFiltersType } from "@/types/ledger"

interface LedgerFiltersProps {
  universities: University[]
  initialFilters: LedgerFiltersType
}

export function LedgerFilters({ universities, initialFilters }: LedgerFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState<LedgerFiltersType>({
    university: initialFilters.university || 'all',
    start_date: initialFilters.start_date || '',
    end_date: initialFilters.end_date || '',
    transaction_type: initialFilters.transaction_type || 'all',
    search: initialFilters.search || ''
  })

  const handleFilterChange = (key: keyof LedgerFiltersType, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      }
    })
    
    router.push(`/ledger?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      university: 'all',
      start_date: '',
      end_date: '',
      transaction_type: 'all',
      search: ''
    })
    router.push('/ledger')
  }

  const setCurrentYear = () => {
    const currentYear = new Date().getFullYear()
    setFilters(prev => ({
      ...prev,
      start_date: `${currentYear}-01-01`,
      end_date: `${currentYear}-12-31`
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Filter Ledger Entries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* University Filter */}
          <div className="space-y-2">
            <Label htmlFor="university">University</Label>
            <Select
              value={filters.university}
              onValueChange={(value) => handleFilterChange('university', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select university" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {universities.map((university) => (
                  <SelectItem key={university.id} value={university.id.toString()}>
                    {university.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Transaction Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="transaction_type">Transaction Type</Label>
            <Select
              value={filters.transaction_type}
              onValueChange={(value) => handleFilterChange('transaction_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="oem_payment">OEM Payment</SelectItem>
                <SelectItem value="commission_payment">Commission Payment</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="adjustment">Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Filter */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search descriptions, references..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Date Range Filters */}
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-2">
            <Label>Quick Actions</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={setCurrentYear}
              >
                Current Year
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={applyFilters}>
            Apply Filters
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
