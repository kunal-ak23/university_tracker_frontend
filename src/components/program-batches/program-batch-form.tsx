"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ProgramBatch } from "@/types/program-batch"
import { createProgramBatch, updateProgramBatch } from "@/service/api/program-batches"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPrograms } from "@/service/api/programs"
import { useState, useEffect } from "react"
import { Program } from "@/types/program"
import { format } from "date-fns"

const programBatchFormSchema = z.object({
  program: z.coerce.number().min(1, "Program is required"),
  name: z.string().min(1, "Name is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  number_of_students: z.coerce.number().min(1, "Number of students is required"),
  cost_per_student: z.coerce.number().optional(),
  status: z.enum(["planned", "ongoing", "completed"]).default("planned"),
  notes: z.string().optional(),
})

type ProgramBatchFormValues = z.infer<typeof programBatchFormSchema>

interface ProgramBatchFormProps {
  mode?: 'create' | 'edit'
  programBatch?: ProgramBatch
  onSuccess?: () => void
}

export function ProgramBatchForm({ 
  mode = 'create', 
  programBatch,
  onSuccess 
}: ProgramBatchFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [programs, setPrograms] = useState<Program[]>([])

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const data = await getPrograms()
        setPrograms(data.results)
      } catch (error) {
        console.error("Failed to fetch programs:", error)
        toast({
          title: "Error",
          description: "Failed to load programs",
          variant: "destructive",
        })
      }
    }
    fetchPrograms()
  }, [])

  const form = useForm<ProgramBatchFormValues>({
    resolver: zodResolver(programBatchFormSchema),
    defaultValues: {
      program: programBatch?.program,
      name: programBatch?.name ?? "",
      start_date: programBatch?.start_date ? format(new Date(programBatch.start_date), "yyyy-MM-dd") : "",
      end_date: programBatch?.end_date ? format(new Date(programBatch.end_date), "yyyy-MM-dd") : "",
      number_of_students: programBatch?.number_of_students ?? 0,
      cost_per_student: programBatch?.cost_per_student,
      status: programBatch?.status ?? "planned",
      notes: programBatch?.notes ?? "",
    },
  })

  const { isDirty, isValid } = form.formState

  async function onSubmit(data: ProgramBatchFormValues) {
    try {
      if (mode === 'edit' && programBatch) {
        await updateProgramBatch(programBatch.id, data)
        toast({
          title: "Success",
          description: "Program batch updated successfully",
        })
      } else {
        await createProgramBatch(data)
        toast({
          title: "Success",
          description: "Program batch created successfully",
        })
      }
      onSuccess?.()
      router.refresh()
    } catch (error) {
      console.error(`Failed to ${mode} program batch:`, error)
      toast({
        title: "Error",
        description: `Failed to ${mode} program batch`,
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="program"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name}
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

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="number_of_students"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Students</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost_per_student"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost per Student</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter any additional notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={mode === 'edit' ? (!isDirty || !isValid) : !isValid}
          >
            {mode === 'edit' ? 'Update' : 'Create'} Batch
          </Button>
        </div>
      </form>
    </Form>
  )
} 
