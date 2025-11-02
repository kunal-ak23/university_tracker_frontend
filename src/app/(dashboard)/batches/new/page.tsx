"use client"

import { BatchForm } from "@/components/batches/batch-form"
import { useSearchParams } from "next/navigation"

export default function NewBatchPage() {
  const searchParams = useSearchParams()
  
  // Get initial values from URL params if they exist (for duplicating)
  const initialValues = searchParams.get('copyFrom') ? {
    university: searchParams.get('university') || '',
    program: searchParams.get('program') || '',
    stream: searchParams.get('stream') || '',
    name: searchParams.get('name') || '',
    number_of_students: searchParams.get('number_of_students') || '',
    start_year: searchParams.get('start_year') ? String(parseInt(searchParams.get('start_year')!) + 1) : '',
    end_year: searchParams.get('end_year') ? String(parseInt(searchParams.get('end_year')!) + 1) : '',
    start_date: searchParams.get('start_date') || '', // Will be incremented by 1 year in form
    end_date: searchParams.get('end_date') || '', // Will be incremented by 1 year in form
    status: searchParams.get('status') || 'planned',
    notes: searchParams.get('notes') || '',
  } : undefined

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create New Batch</h2>
        <p className="text-gray-600">Add a new batch to track students and revenue.</p>
      </div>
      <BatchForm mode="create" initialValues={initialValues} />
    </div>
  )
} 