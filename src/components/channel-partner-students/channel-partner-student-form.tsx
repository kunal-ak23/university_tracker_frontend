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
import { ChannelPartnerStudent, CreateChannelPartnerStudentData } from "@/types/channel-partner-student"
import { createChannelPartnerStudent } from "@/service/api/channel-partner-students"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getStudents } from "@/service/api/students"
import { getChannelPartners } from "@/service/api/channel-partners"
import { useState, useEffect } from "react"
import { Student } from "@/types/student"
import { ChannelPartner } from "@/types/channel-partner"
import { format } from "date-fns"
import { getProgramBatch } from "@/service/api/program-batches"

const channelPartnerStudentFormSchema = z.object({
  channel_partner: z.coerce.number().min(1, "Channel partner is required"),
  program_batch: z.coerce.number().optional(),
  batch: z.coerce.number().optional(),
  student: z.coerce.number().min(1, "Student is required"),
  enrollment_date: z.string().min(1, "Enrollment date is required"),
  status: z.enum(["enrolled", "completed", "dropped"]).default("enrolled"),
  notes: z.string().optional(),
  transfer_price: z.coerce.number().min(0, "Transfer price is required"),
  commission_rate: z.coerce.number().min(0, "Commission rate is required"),
}).refine((data) => {
  // Either program_batch or batch must be provided, but not both
  return (data.program_batch && !data.batch) || (!data.program_batch && data.batch)
}, {
  message: "You must specify either program batch or university batch, but not both",
  path: ["program_batch"]
})

type ChannelPartnerStudentFormValues = z.infer<typeof channelPartnerStudentFormSchema>

interface ChannelPartnerStudentFormProps {
  mode?: 'create' | 'edit'
  channelPartnerStudent?: ChannelPartnerStudent
  onSuccess?: () => void
  programBatchId?: number
  batchId?: number
}

export function ChannelPartnerStudentForm({ 
  mode = 'create', 
  channelPartnerStudent,
  onSuccess,
  programBatchId,
  batchId
}: ChannelPartnerStudentFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [channelPartners, setChannelPartners] = useState<ChannelPartner[]>([])
  const [selectedChannelPartner, setSelectedChannelPartner] = useState<ChannelPartner | null>(null)
  const [selectedProgramBatch, setSelectedProgramBatch] = useState<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsData, channelPartnersData] = await Promise.all([
          getStudents(),
          getChannelPartners()
        ])
        setStudents(studentsData.results)
        setChannelPartners(channelPartnersData.results)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        })
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (programBatchId) {
      setSelectedProgramBatch(programBatchId)
    }
  }, [programBatchId])

  const form = useForm<ChannelPartnerStudentFormValues>({
    resolver: zodResolver(channelPartnerStudentFormSchema),
    defaultValues: {
      channel_partner: channelPartnerStudent?.channel_partner,
      program_batch: programBatchId || channelPartnerStudent?.program_batch,
      batch: batchId || channelPartnerStudent?.batch,
      student: channelPartnerStudent?.student,
      enrollment_date: channelPartnerStudent?.enrollment_date ? format(new Date(channelPartnerStudent.enrollment_date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      status: channelPartnerStudent?.status ?? "enrolled",
      notes: channelPartnerStudent?.notes ?? "",
      transfer_price: channelPartnerStudent?.transfer_price ?? 0,
      commission_rate: channelPartnerStudent?.commission_rate ?? 0,
    },
  })

  const { isDirty, isValid } = form.formState

  const handleChannelPartnerChange = async (value: string) => {
    const partner = channelPartners.find(p => p.id.toString() === value)
    setSelectedChannelPartner(partner || null)
    form.setValue("channel_partner", parseInt(value))
  }

  const handleProgramBatchChange = async (value: string) => {
    const batchId = parseInt(value)
    setSelectedProgramBatch(batchId)
    form.setValue("program_batch", batchId)
    
    try {
      const batch = await getProgramBatch(batchId)
      if (batch.cost_per_student) {
        form.setValue("transfer_price", batch.cost_per_student)
        if (selectedChannelPartner?.commission_rate) {
          form.setValue("commission_rate", selectedChannelPartner.commission_rate)
        }
      }
    } catch (error) {
      console.error("Failed to fetch program batch:", error)
    }
  }

  async function onSubmit(data: ChannelPartnerStudentFormValues) {
    try {
      const createData = {
        ...data,
        program_batch: data.program_batch || undefined,
        batch: data.batch || undefined,
      }

      await createChannelPartnerStudent(createData)
      toast({
        title: "Success",
        description: "Student added to batch successfully",
      })
      onSuccess?.()
      router.refresh()
    } catch (error) {
      console.error("Failed to add student to batch:", error)
      toast({
        title: "Error",
        description: "Failed to add student to batch",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="channel_partner"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Channel Partner</FormLabel>
              <Select onValueChange={handleChannelPartnerChange} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a channel partner" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {channelPartners.map((partner) => (
                    <SelectItem key={partner.id} value={partner.id.toString()}>
                      {partner.name}
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
          name="student"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.name}
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
          name="enrollment_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enrollment Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transfer_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transfer Price</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commission_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Commission Rate (%)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="enrolled">Enrolled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
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
            {mode === 'edit' ? 'Update' : 'Add'} Student
          </Button>
        </div>
      </form>
    </Form>
  )
} 
