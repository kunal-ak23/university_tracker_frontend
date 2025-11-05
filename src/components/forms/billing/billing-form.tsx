"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useReturnNavigation } from "@/service/utils/navigation"
import { useState, useEffect } from "react"
import { MultiSelect } from "@/components/ui/multi-select"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Billing, BillingCreateInput } from "@/types/billing"
import { createBilling, updateBilling, publishBilling } from "@/service/api/billings-client"
import { Batch } from "@/types/batch"
import { getUniversities } from "@/service/api/universities"
import { University } from "@/types/university"
import { OEM } from "@/types/oem"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, IndianRupee, Percent } from "lucide-react"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"

const billingFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  university: z.string().min(1, "University is required"),
  year: z.string().min(1, "Year is required"),
  oem: z.string().optional(),
  batches: z.array(z.string()).min(1, "At least one batch is required"),
  notes: z.string().optional(),
})

type BillingFormValues = z.infer<typeof billingFormSchema>

interface BillingFormProps {
  mode?: 'create' | 'edit'
  billing?: Billing
  availableBatches: Array<Batch>
}

function isBatch(batch: any): batch is Batch {
  return typeof batch === 'object' && batch !== null && 'id' in batch
}

export function BillingForm({ mode = 'create', billing, availableBatches }: BillingFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { navigateBack, getReturnUrl } = useReturnNavigation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPublishDialog, setShowPublishDialog] = useState(false)
  const [draftId, setDraftId] = useState<string | null>(billing?.id || null)
  // Extract university and year from billing batches
  const getUniversityFromBilling = (): string => {
    if (!billing?.batches || billing.batches.length === 0) return ""
    
    // Get first batch (could be ID or object)
    const firstBatchId = typeof billing.batches[0] === 'number' 
      ? billing.batches[0] 
      : typeof billing.batches[0] === 'object' && billing.batches[0]?.id
        ? billing.batches[0].id
        : null
    
    if (!firstBatchId) return ""
    
    // Find the batch in availableBatches
    const batch = availableBatches.find(b => b.id === firstBatchId || b.id === Number(firstBatchId))
    if (!batch) return ""
    
    // Extract university ID
    const universityId = typeof batch.university === 'object' 
      ? batch.university?.id?.toString()
      : batch.university?.toString()
    
    return universityId || ""
  }
  
  const getYearFromBilling = (): string => {
    if (!billing?.batches || billing.batches.length === 0) {
      return new Date().getFullYear().toString()
    }
    
    // Get first batch (could be ID or object)
    const firstBatchId = typeof billing.batches[0] === 'number' 
      ? billing.batches[0] 
      : typeof billing.batches[0] === 'object' && billing.batches[0]?.id
        ? billing.batches[0].id
        : null
    
    if (!firstBatchId) return new Date().getFullYear().toString()
    
    // Find the batch in availableBatches
    const batch = availableBatches.find(b => b.id === firstBatchId || b.id === Number(firstBatchId))
    if (!batch) return new Date().getFullYear().toString()
    
    // Use start_year as the year
    return batch.start_year?.toString() || new Date().getFullYear().toString()
  }

  const [selectedBatches, setSelectedBatches] = useState<string[]>(
    billing?.batches.map(b => {
      if (typeof b === 'number') return b.toString()
      if (typeof b === 'string') return b
      if (isBatch(b)) return b.id.toString()
      return ''
    }).filter(Boolean) || []
  )
  const [universities, setUniversities] = useState<University[]>([])
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>(availableBatches)
  const [availableOEMs, setAvailableOEMs] = useState<OEM[]>([])
  const [batchesByOEM, setBatchesByOEM] = useState<Map<number, Batch[]>>(new Map())

  const form = useForm<BillingFormValues>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      name: billing?.name ?? "",
      university: "", // Will be set via useEffect
      year: new Date().getFullYear().toString(), // Will be set via useEffect
      oem: "",
      notes: billing?.notes ?? "",
      batches: selectedBatches,
    },
  })

  // Populate university and year from billing batches when in edit mode
  useEffect(() => {
    if (mode === 'edit' && billing && availableBatches.length > 0) {
      const universityId = getUniversityFromBilling()
      const year = getYearFromBilling()
      
      if (universityId) {
        form.setValue('university', universityId)
      }
      if (year) {
        form.setValue('year', year)
      }
    }
  }, [mode, billing, availableBatches, form])

  // Fetch universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await getUniversities()
        setUniversities(data.results)
      } catch (error) {
        console.error("Error fetching universities:", error)
        toast({
          title: "Error",
          description: "Failed to fetch universities",
          variant: "destructive",
        })
      }
    }
    fetchUniversities()
  }, [toast])

  // Filter batches based on selected university and year, extract OEMs
  useEffect(() => {
    const university = form.watch('university')
    const year = form.watch('year')
    const selectedOEM = form.watch('oem')
    
    if (university && year) {
      // First filter by university and year
      let filtered = availableBatches.filter(batch => {
        const universityId = typeof batch.university === 'object' 
          ? batch.university?.id?.toString() 
          : batch.university?.toString()
        return universityId === university && 
               batch.start_year <= parseInt(year) && 
               batch.end_year >= parseInt(year)
      })
      
      // Extract unique OEMs from filtered batches
      const oemMap = new Map<string, OEM>()
      filtered.forEach(batch => {
        if (batch.oem) {
          let oem: OEM | null = null
          let oemId: string
          
          // Handle different possible types for batch.oem (API might return different formats)
          const oemValue = batch.oem as unknown
          
          if (typeof oemValue === 'object' && oemValue !== null) {
            // OEM is an object - id is always a string in OEM type
            oem = oemValue as OEM
            oemId = oem.id
          } else if (typeof oemValue === 'number') {
            // OEM is just an ID number - we'd need to fetch it, but for now create a placeholder
            oemId = oemValue.toString()
            // We can't create a full OEM object from just an ID without fetching
            // This shouldn't happen if serializer is working correctly
            console.warn('Batch has OEM as number ID only:', oemValue)
          } else if (typeof oemValue === 'string') {
            oemId = oemValue
          } else {
            return // Skip if OEM is not in expected format
          }
          
          if (oem && oemId && !oemMap.has(oemId)) {
            oemMap.set(oemId, oem)
          }
        }
      })
      
      const uniqueOEMs = Array.from(oemMap.values())
      console.log('Extracted OEMs from batches:', uniqueOEMs.length, uniqueOEMs.map(o => ({ id: o.id, name: o.name })))
      console.log('Filtered batches before OEM filter:', filtered.length, filtered.slice(0, 3).map(b => ({ 
        id: b.id, 
        name: b.name, 
        oem: b.oem,
        oemType: typeof b.oem,
        oemId: typeof b.oem === 'object' && b.oem !== null ? (b.oem as OEM).id : b.oem
      })))
      setAvailableOEMs(uniqueOEMs)
      
      // Auto-select OEM if only one exists (but don't filter - all batches already belong to this OEM)
      const shouldAutoSelectOEM = uniqueOEMs.length === 1 && !selectedOEM
      if (shouldAutoSelectOEM) {
        const singleOEMId = String(uniqueOEMs[0].id)
        console.log('Auto-selecting single OEM:', singleOEMId)
        form.setValue('oem', singleOEMId, { shouldValidate: false })
        // Don't filter by OEM when auto-selecting - all filtered batches already belong to this OEM
      } else if (uniqueOEMs.length === 0 && selectedOEM) {
        // Clear OEM selection if no OEMs found
        form.setValue('oem', '', { shouldValidate: false })
      }
      
      // Filter by OEM if selected AND multiple OEMs exist
      // If only one OEM exists, we don't filter by OEM since all batches already belong to that OEM
      if (selectedOEM && uniqueOEMs.length > 1) {
        console.log('Filtering batches by OEM:', selectedOEM, 'from', filtered.length, 'batches')
        const beforeFilterCount = filtered.length
        filtered = filtered.filter(batch => {
          if (!batch.oem) {
            console.warn('Batch missing OEM:', batch.id, batch.name)
            return false
          }
          let batchOEMId: string
          
          // Handle different possible types for batch.oem (API might return different formats)
          const oemValue = batch.oem as unknown
          
          if (typeof oemValue === 'object' && oemValue !== null) {
            // OEM is an object - id is always a string in OEM type
            batchOEMId = (oemValue as OEM).id
          } else if (typeof oemValue === 'number') {
            batchOEMId = oemValue.toString()
          } else if (typeof oemValue === 'string') {
            batchOEMId = oemValue
          } else {
            console.warn('Batch OEM in unexpected format:', batch.id, batch.name, oemValue)
            return false
          }
          
          // Normalize both IDs to strings for comparison
          const normalizedBatchOEMId = String(batchOEMId)
          const normalizedSelectedOEM = String(selectedOEM)
          const matches = normalizedBatchOEMId === normalizedSelectedOEM
          
          if (!matches) {
            console.log('Batch OEM mismatch:', {
              batchId: batch.id,
              batchName: batch.name,
              batchOEMId: normalizedBatchOEMId,
              selectedOEM: normalizedSelectedOEM,
              rawBatchOEMId: batchOEMId,
              rawSelectedOEM: selectedOEM,
              types: { batchOEMId: typeof batchOEMId, selectedOEM: typeof selectedOEM }
            })
          }
          return matches
        })
        console.log('After OEM filter:', filtered.length, 'batches remaining (from', beforeFilterCount, ')')
      }
      
      // Group batches by OEM for reference
      const batchesByOEMMap = new Map<number, Batch[]>()
      filtered.forEach(batch => {
        if (batch.oem) {
          // Convert OEM ID to number for grouping (OEM.id is always string)
          const oemValue = batch.oem as unknown
          const oemId = typeof oemValue === 'object' && oemValue !== null 
            ? parseInt((oemValue as OEM).id) 
            : (typeof oemValue === 'string' ? parseInt(oemValue) : (typeof oemValue === 'number' ? oemValue : 0))
          if (!batchesByOEMMap.has(oemId)) {
            batchesByOEMMap.set(oemId, [])
          }
          batchesByOEMMap.get(oemId)!.push(batch)
        }
      })
      setBatchesByOEM(batchesByOEMMap)
      
      console.log('Final filtered batches count:', filtered.length, 'uniqueOEMs:', uniqueOEMs.length, 'selectedOEM:', selectedOEM)
      setFilteredBatches(filtered)
      
      // Auto-select all filtered batches when university, year, or OEM changes
      const filteredBatchIds = filtered.map(batch => batch.id.toString())
      if (filteredBatchIds.length > 0) {
        setSelectedBatches(filteredBatchIds)
        form.setValue('batches', filteredBatchIds)
      } else {
        // Clear selection if no batches match
        setSelectedBatches([])
        form.setValue('batches', [])
      }
    } else {
      setFilteredBatches(availableBatches)
      setAvailableOEMs([])
      setBatchesByOEM(new Map())
    }
  }, [form.watch('university'), form.watch('year'), form.watch('oem'), availableBatches, form])

  // Sync selectedBatches with form value when form value changes
  useEffect(() => {
    const formBatches = form.watch('batches')
    if (formBatches && formBatches.length > 0) {
      setSelectedBatches(formBatches)
    }
  }, [form.watch('batches')])

  // Get selected batch details
  const selectedBatchDetails = filteredBatches.filter(batch => 
    selectedBatches.includes(batch.id.toString())
  )

  // Calculate billing summary
  const billingSummary = selectedBatchDetails.reduce((summary, batch) => {
    const costPerStudent = parseFloat(batch.effective_cost_per_student) || 0
    const oemTransferPrice = parseFloat(batch.effective_oem_transfer_price) || 0
    const taxRate = parseFloat(batch.effective_tax_rate) || 0
    
    const baseAmount = batch.number_of_students * costPerStudent
    const totalAmount = baseAmount * (1 + taxRate / 100)

    const baseOEMTransfer = batch.number_of_students * oemTransferPrice
    const totalOEMTransfer = baseOEMTransfer * (1 + taxRate / 100)

    return {
      totalStudents: summary.totalStudents + batch.number_of_students,
      totalAmount: summary.totalAmount + (isNaN(totalAmount) ? 0 : totalAmount),
      totalOEMTransfer: summary.totalOEMTransfer + (isNaN(totalOEMTransfer) ? 0 : totalOEMTransfer),
    }
  }, {
    totalStudents: 0,
    totalAmount: 0,
    totalOEMTransfer: 0,
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'planned':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  async function onSubmit(data: BillingFormValues) {
    try {
      setIsSubmitting(true)
      
      // Prepare payload - convert batch IDs to integers for backend
      // Include OEM if provided (for filtering/validation purposes)
      const payload: BillingCreateInput = {
        name: data.name,
        batches: data.batches.map(id => parseInt(id, 10)), // Convert string IDs to integers
        notes: data.notes,
        ...(data.oem && { oem: data.oem }), // Include OEM if provided (for validation/filtering)
      }
      
      if (mode === 'edit' && billing) {
        await updateBilling(billing.id, payload)
        toast({
          title: "Success",
          description: "Receivable updated successfully",
        })
        navigateBack()
      } else {
        // Create draft billing
        const response = await createBilling(payload)
        setDraftId(response.id)
        toast({
          title: "Success",
          description: "Draft billing created successfully.",
        })
        // Redirect to detail page with returnTo
        const returnTo = getReturnUrl() || '/billings'
        router.push(`/billings/${response.id}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`)
        router.refresh()
      }
    } catch (error) {
      console.error(`Failed to ${mode} billing:`, error)
      toast({
        title: "Error",
        description: `Failed to ${mode} billing`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handlePublish() {
    if (!draftId) return

    try {
      setIsSubmitting(true)
      await publishBilling(draftId)
      toast({
        title: "Success",
        description: "Receivable published successfully",
      })
      navigateBack()
    } catch (error) {
      console.error('Failed to publish billing:', error)
      toast({
        title: "Error",
        description: "Failed to publish receivable",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setShowPublishDialog(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Billing Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter billing name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem key={university.id} value={university.id.toString()}>
                        {university.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="2025"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* OEM Selection - show if OEMs exist (multiple or single) */}
        {availableOEMs.length > 0 && (
          <FormField
            control={form.control}
            name="oem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>OEM{availableOEMs.length > 1 ? ' (select one)' : ''}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || (availableOEMs.length === 1 ? String(availableOEMs[0].id) : '')}
                  disabled={availableOEMs.length === 1}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={availableOEMs.length === 1 ? "OEM (pre-selected)" : "Select OEM"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableOEMs.map((oem) => (
                      <SelectItem 
                        key={oem.id} 
                        value={String(oem.id)}
                      >
                        {oem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableOEMs.length === 1 && (
                  <p className="text-sm text-muted-foreground">
                    Only one OEM found for selected university and year. This OEM will be used for the billing.
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="batches"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Batches</FormLabel>
              <FormControl>
                <MultiSelect
                  options={filteredBatches.map(batch => ({
                    label: `${batch.name} (${typeof batch.stream === 'object' ? batch.stream?.name || 'Unknown Stream' : 'Unknown Stream'})`,
                    value: batch.id.toString()
                  }))}
                  value={selectedBatches}
                  onValueChange={(values) => {
                    setSelectedBatches(values)
                    field.onChange(values)
                  }}
                  placeholder="Select batches"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Billing Summary */}
        {selectedBatchDetails.length > 0 && (
          <div className="rounded-lg border p-4 space-y-4">
            <h4 className="font-medium text-gray-700">Billing Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-lg font-semibold">{billingSummary.totalStudents}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-lg font-semibold">₹{billingSummary.totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">OEM Transfer Amount</p>
                <p className="text-lg font-semibold">₹{billingSummary.totalOEMTransfer.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Batches Details */}
        {selectedBatchDetails.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Selected Batch Details</h4>
            <div className="grid grid-cols-2 gap-4">
              {selectedBatchDetails.map((batch) => {
                const effectiveCostPerStudent = parseFloat(batch.effective_cost_per_student) || 0
                const effectiveOEMTransfer = parseFloat(batch.effective_oem_transfer_price) || 0
                const effectiveTaxRate = parseFloat(batch.effective_tax_rate) || 0
                const numStudents = batch.number_of_students

                const baseTotal = numStudents * effectiveCostPerStudent
                const taxAmount = baseTotal * (effectiveTaxRate / 100)
                const totalWithTax = baseTotal * (1 + effectiveTaxRate / 100)

                const baseOEMTransfer = numStudents * effectiveOEMTransfer
                const oemTaxAmount = baseOEMTransfer * (effectiveTaxRate / 100)
                const oemTotalWithTax = baseOEMTransfer * (1 + effectiveTaxRate / 100)

                return (
                  <div key={batch.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">{batch.name}</h4>
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="h-4 w-4" />
                        {numStudents} students
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {batch.start_year} - {batch.end_year}
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-sm text-gray-600">
                        <Percent className="h-4 w-4" />
                        Tax Rate: {isNaN(effectiveTaxRate) ? '0' : effectiveTaxRate}%
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-sm font-medium">
                        <IndianRupee className="h-4 w-4" />
                        Base Cost: ₹{isNaN(effectiveCostPerStudent) ? '0' : effectiveCostPerStudent.toLocaleString('en-IN')} per student
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-sm font-medium">
                        <IndianRupee className="h-4 w-4" />
                        With Tax: ₹{isNaN(effectiveCostPerStudent * (1 + effectiveTaxRate / 100)) ? '0' : (effectiveCostPerStudent * (1 + effectiveTaxRate / 100)).toLocaleString('en-IN')} per student
                      </div>
                      <div className="col-span-2 border-t pt-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Base Total:</span>
                            <span>₹{isNaN(baseTotal) ? '0' : baseTotal.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Tax Amount:</span>
                            <span>₹{isNaN(taxAmount) ? '0' : taxAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm font-medium">
                            <span>Total with Tax:</span>
                            <span>₹{isNaN(totalWithTax) ? '0' : totalWithTax.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 border-t pt-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Base OEM Transfer:</span>
                            <span>₹{isNaN(baseOEMTransfer) ? '0' : baseOEMTransfer.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Tax Amount:</span>
                            <span>₹{isNaN(oemTaxAmount) ? '0' : oemTaxAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm font-medium">
                            <span>OEM Total with Tax:</span>
                            <span>₹{isNaN(oemTotalWithTax) ? '0' : oemTotalWithTax.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {batch.notes && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {batch.notes}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigateBack()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {draftId ? (
            <Button
              type="button"
              onClick={() => setShowPublishDialog(true)}
              disabled={isSubmitting}
            >
              Publish Billing
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {mode === 'edit' ? 'Update' : 'Save as Draft'}
            </Button>
          )}
        </div>
      </form>

      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title="Publish Billing"
        description="Are you sure you want to publish this billing? This action cannot be undone."
        confirmText="Publish"
        onConfirm={handlePublish}
      />
    </Form>
  )
} 
