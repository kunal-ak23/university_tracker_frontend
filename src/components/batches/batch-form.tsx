"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { createBatch, updateBatch } from "@/service/api/batches"
import { getContractPricing } from "@/service/api/contracts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { University } from "@/types/university"
import { Stream } from "@/types/stream"
import { getUniversities, getUniversityStreams } from "@/service/api/universities"
import { cn } from "@/service/utils"
import { Batch } from "@/types/batch"

const batchFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  university: z.string().min(1, "University is required"),
  stream: z.string().min(1, "Stream is required"),
  number_of_students: z.string()
    .min(1, "Number of students is required"),
  start_year: z.string()
    .min(1, "Start year is required"),
  end_year: z.string()
    .min(1, "End year is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.enum(["planned", "ongoing", "completed"]),
  notes: z.string().optional(),
})

export type BatchFormValues = z.infer<typeof batchFormSchema>

interface BatchFormProps {
  mode?: 'create' | 'edit'
  batch?: Batch
}

const statusOptions = [
  { label: "Planned", value: "planned" },
  { label: "Ongoing", value: "ongoing" },
  { label: "Completed", value: "completed" },
]

export function BatchForm({ mode = 'create', batch }: BatchFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [streams, setStreams] = useState<Stream[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [initialValues, setInitialValues] = useState<BatchFormValues | null>(null)

  // Fetch universities on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedUniversities = await getUniversities()
        setUniversities(fetchedUniversities.results)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast({
          title: "Error",
          description: "Failed to load required data",
          variant: "destructive",
        })
      }
    }
    fetchData()
  }, [toast])

  // Load initial streams if editing a batch
  useEffect(() => {
    if (mode === 'edit' && batch?.university) {
      const universityId = typeof batch.university === 'object' ? batch.university.id : batch.university
      const university = universities.find(u => u.id.toString() === universityId.toString())
      if (university) {
        setSelectedUniversity(university)
        // Load streams for the university
        getUniversityStreams(university.id.toString()).then(streamsData => {
          setStreams(streamsData.results)
        }).catch(error => {
          console.error('Failed to load streams:', error)
        })
      }
    }
  }, [mode, batch, universities])

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: batch?.name ?? "",
      university: (batch?.university && typeof batch.university === 'object' ? batch.university.id : batch?.university)?.toString() ?? "",
      stream: (batch?.stream && typeof batch.stream === 'object' ? batch.stream.id : batch?.stream)?.toString() ?? "",
      number_of_students: batch?.number_of_students?.toString() ?? "",
      start_year: batch?.start_year?.toString() ?? new Date().getFullYear().toString(),
      end_year: batch?.end_year?.toString() ?? (new Date().getFullYear() + 1).toString(),
      start_date: batch?.start_date ?? "",
      end_date: batch?.end_date ?? "",
      status: batch?.status as "ongoing" | "planned" | "completed" | undefined ?? "planned",
      notes: batch?.notes ?? "",
    },
  })

  // Watch form state
  const formValues = form.watch()

  // Store initial values when form is mounted or batch changes
  useEffect(() => {
    const values = form.getValues()
    setInitialValues(values)
  }, [form, batch])

  // Function to check if form values have changed
  const hasFormChanged = () => {
    if (!initialValues) return false
    
    const changes = Object.keys(formValues).filter(key => {
      const initialValue = initialValues[key as keyof BatchFormValues]
      const currentValue = formValues[key as keyof BatchFormValues]
      
      return initialValue !== currentValue
    })
    
    return changes.length > 0
  }

  // Update streams when university changes
  useEffect(() => {
    const subscription = form.watch(async (value, { name }) => {
      if (name === 'university' && value.university) {
        try {
          const selectedUniversity = universities.find(u => u.id.toString() === value.university)
          if (selectedUniversity) {
            setSelectedUniversity(selectedUniversity)
            const universityStreams = await getUniversityStreams(selectedUniversity.id.toString())
            setStreams(universityStreams.results)
            // Reset stream when university changes
            form.setValue('stream', '')
          }
        } catch (error) {
          console.error('Failed to update streams:', error)
          toast({
            title: "Error",
            description: "Failed to load streams for the selected university",
            variant: "destructive",
          })
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, toast, universities])

  // State for effective pricing
  const [effectivePricing, setEffectivePricing] = useState({
    cost_per_student: "0.00",
    oem_transfer_price: "0.00", 
    tax_rate: "0.00"
  })

  // Fetch pricing when university, stream, or start year changes
  useEffect(() => {
    const fetchPricing = async () => {
      const university = form.watch('university')
      const stream = form.watch('stream')
      const startYear = form.watch('start_year')
      
      if (university && stream && startYear) {
        try {
          const data = await getContractPricing(university, stream, startYear)
          setEffectivePricing({
            cost_per_student: data.cost_per_student || "0.00",
            oem_transfer_price: data.oem_transfer_price || "0.00",
            tax_rate: data.tax_rate || "0.00"
          })
        } catch (error) {
          console.error('Error fetching pricing:', error)
        }
      } else {
        setEffectivePricing({
          cost_per_student: "0.00",
          oem_transfer_price: "0.00",
          tax_rate: "0.00"
        })
      }
    }
    
    fetchPricing()
  }, [form.watch('university'), form.watch('stream'), form.watch('start_year')])

  async function onSubmit(data: BatchFormValues) {
    try {
      const submitData = {
        name: data.name,
        university_id: parseInt(data.university),
        stream_id: parseInt(data.stream),
        number_of_students: parseInt(data.number_of_students),
        start_year: parseInt(data.start_year),
        end_year: parseInt(data.end_year),
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        notes: data.notes || null,
      }

      if (mode === 'edit' && batch) {
        // @ts-ignore 
        await updateBatch(batch.id.toString(), submitData)
        toast({
          title: "Success",
          description: "Batch updated successfully",
        })
      } else {
        // @ts-ignore 
        await createBatch(submitData)
        toast({
          title: "Success",
          description: "Batch created successfully",
        })
      }
      router.push('/batches')
      router.refresh()
    } catch (error) {
      console.error(`Failed to ${mode} batch:`, error)
      toast({
        title: "Error",
        description: `Failed to ${mode} batch`,
        variant: "destructive",
      })
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter batch name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="university"
            render={({ field }) => (
              <FormItem>
                <FormLabel>University</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem 
                        key={university.id} 
                        value={university.id.toString()}
                      >
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
            name="stream"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stream</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedUniversity}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedUniversity ? "Select stream" : "Select a university first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {streams.map((stream) => (
                      <SelectItem 
                        key={stream.id} 
                        value={stream.id.toString()}
                      >
                        {stream.name}
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
            name="number_of_students"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Students</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter number of students" 
                    min="1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem 
                        key={status.value} 
                        value={status.value}
                      >
                        {status.label}
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
            name="start_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter start year" 
                    min="1900"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter end year" 
                    min="1900"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pricing is automatically calculated from contract's stream pricing */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Automatic Pricing</h3>
            <p className="text-sm text-blue-700">
              Pricing will be automatically calculated based on the selected university, stream, and year from the contract's stream-specific pricing.
            </p>
            <div className="mt-2 text-sm text-blue-600">
              <p>• Cost per Student: {effectivePricing.cost_per_student}</p>
              <p>• OEM Transfer Price: {effectivePricing.oem_transfer_price}</p>
              <p>• Tax Rate: {effectivePricing.tax_rate}%</p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter any additional notes" 
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          disabled={mode === 'create' ? !form.formState.isDirty || !form.formState.isValid : !hasFormChanged() || !form.formState.isValid}
        >
          {mode === 'edit' ? 'Update' : 'Create'} Batch
        </Button>
      </form>
    </Form>
  )
} 
