"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createUniversityYearBilling } from "@/service/api/billings"
import { getUniversities } from "@/service/api/universities"
import { University } from "@/types/university"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, DollarSign, Calendar } from "lucide-react"

const universityYearBillingSchema = z.object({
  university_id: z.string().min(1, "University is required"),
  year: z.string().min(1, "Year is required"),
  name: z.string().optional(),
  notes: z.string().optional(),
})

type UniversityYearBillingFormValues = z.infer<typeof universityYearBillingSchema>

interface UniversityYearBillingFormProps {
  onSuccess?: (billingId: number) => void
  onCancel?: () => void
}

export function UniversityYearBillingForm({ onSuccess, onCancel }: UniversityYearBillingFormProps) {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  const form = useForm<UniversityYearBillingFormValues>({
    resolver: zodResolver(universityYearBillingSchema),
    defaultValues: {
      university_id: "",
      year: new Date().getFullYear().toString(),
      name: "",
      notes: "",
    },
  })

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

  const selectedUniversity = form.watch("university_id")
  const selectedYear = form.watch("year")

  // Generate preview when university and year are selected
  useEffect(() => {
    if (selectedUniversity && selectedYear) {
      const university = universities.find(u => u.id.toString() === selectedUniversity)
      if (university) {
        setPreviewData({
          university: university.name,
          year: selectedYear,
          billingName: form.getValues("name") || `Billing for ${selectedYear}`
        })
      }
    }
  }, [selectedUniversity, selectedYear, universities, form])

  const onSubmit = async (data: UniversityYearBillingFormValues) => {
    setLoading(true)
    try {
      const result = await createUniversityYearBilling({
        university_id: parseInt(data.university_id),
        year: parseInt(data.year),
        name: data.name || `Billing for ${data.year}`,
        notes: data.notes || "",
      })

      toast({
        title: "Success",
        description: `Billing created successfully with ${result.batches.length} batches`,
      })

      if (onSuccess) {
        onSuccess(result.id)
      }
    } catch (error: any) {
      console.error("Error creating billing:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create billing",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    if (selectedUniversity && selectedYear) {
      setShowPreview(true)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create University Year Billing</h2>
        <p className="text-muted-foreground">
          Create a billing for a university for a specific year with all operational batches
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="university_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>University</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billing Name (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`Billing for ${selectedYear || 'Year'}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {previewData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Preview
                </CardTitle>
                <CardDescription>
                  This billing will include all operational batches for the selected university and year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{previewData.university}</Badge>
                    <Badge variant="secondary">{previewData.year}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Billing Name: {previewData.billingName}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={loading || !selectedUniversity || !selectedYear}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Billing
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}
