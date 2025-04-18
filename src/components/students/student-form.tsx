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
import { Student } from "@/types/student"
import { createStudent, updateStudent } from "@/service/api/students"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const studentFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Must be a valid email"),
  phone: z.string().optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  enrollment_source: z.enum(["direct", "channel_partner", "university"]).default("direct"),
  status: z.enum(["active", "completed", "dropped"]).default("active"),
})

type StudentFormValues = z.infer<typeof studentFormSchema>

interface StudentFormProps {
  mode?: 'create' | 'edit'
  student?: Student
}

export function StudentForm({ mode = 'create', student }: StudentFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      name: student?.name ?? "",
      email: student?.email ?? "",
      phone: student?.phone ?? "",
      date_of_birth: student?.date_of_birth ?? "",
      address: student?.address ?? "",
      notes: student?.notes ?? "",
      enrollment_source: student?.enrollment_source ?? "direct",
      status: student?.status ?? "active",
    },
  })

  const { isDirty, isValid } = form.formState

  async function onSubmit(data: StudentFormValues) {
    try {
      if (mode === 'edit' && student) {
        await updateStudent(student.id, data)
        toast({
          title: "Success",
          description: "Student updated successfully",
        })
      } else {
        await createStudent(data)
        toast({
          title: "Success",
          description: "Student created successfully",
        })
      }
      router.push('/students')
      router.refresh()
    } catch (error) {
      console.error(`Failed to ${mode} student:`, error)
      
      // Handle server validation errors
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message)
          
          // Set server-side validation errors in the form
          if (typeof errorData === 'object') {
            Object.keys(errorData).forEach((key) => {
              const messages = errorData[key]
              if (Array.isArray(messages)) {
                form.setError(key as keyof StudentFormValues, {
                  type: 'server',
                  message: messages.join(', ')
                })
              } else if (typeof messages === 'string') {
                form.setError(key as keyof StudentFormValues, {
                  type: 'server',
                  message: messages
                })
              }
            })
          }
          
          // Show a toast with the first error message
          const firstError = Object.values(errorData)[0]
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
          
          toast({
            title: "Error",
            description: errorMessage || `Failed to ${mode} student`,
            variant: "destructive",
          })
        } catch {
          // If error message isn't JSON, show it directly
          toast({
            title: "Error",
            description: error.message || `Failed to ${mode} student`,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to ${mode} student`,
          variant: "destructive",
        })
      }
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
                  <Input placeholder="Enter student name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="student@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enrollment_source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enrollment Source</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="channel_partner">Channel Partner</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                  </SelectContent>
                </Select>
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
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
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
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter address"
                    className="resize-none"
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
              <FormItem className="col-span-2">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Additional information..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={mode === 'edit' ? (!isDirty || !isValid) : !isValid}
          >
            {mode === 'edit' ? 'Update' : 'Create'} Student
          </Button>
        </div>
      </form>
    </Form>
  )
} 
