"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Lead, CreateLeadData, UpdateLeadData, LeadStatus } from "@/types/lead"
import { createLead, updateLead } from "@/service/api/leads-client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().min(10, "Mobile number must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
  status: z.enum(["hot", "warm", "cold", "closed", "converted", "lost", "not_interested", "all"]),
  notes: z.string().optional(),
  assigned_to: z.number().optional(),
  agent: z.number(),
})

type FormData = z.infer<typeof formSchema>

interface LeadFormProps {
  mode: "create" | "edit"
  lead?: Lead
}

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: "hot", label: "Hot" },
  { value: "warm", label: "Warm" },
  { value: "cold", label: "Cold" },
  { value: "closed", label: "Closed" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
  { value: "not_interested", label: "Not Interested" }
]

export function LeadForm({ mode, lead }: LeadFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = useSession()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: lead?.name || "",
      mobile: lead?.mobile || "",
      email: lead?.email || "",
      address: lead?.address || "",
      status: lead?.status || "cold",
      notes: lead?.notes || "",
      assigned_to: lead?.assigned_to?.id,
      agent: session?.user?.id ? parseInt(session.user.id) : undefined,
    },
  })

  async function onSubmit(values: FormData) {
    try {
      console.log("Form values:", values)
      
      if (!session?.user?.id) {
        throw new Error("User not authenticated")
      }

      values.agent = parseInt(session.user.id)

      if (mode === "create") {
        console.log("Creating lead with data:", values)
        const response = await createLead(values as CreateLeadData)
        console.log("Create response:", response)
        toast({
          title: "Success",
          description: "Lead created successfully",
        })
      } else {
        console.log("Updating lead with data:", values)
        const response = await updateLead(lead!.id, values as UpdateLeadData)
        console.log("Update response:", response)
        toast({
          title: "Success",
          description: "Lead updated successfully",
        })
      }
      router.push("/leads")
      router.refresh()
    } catch (error) {
      console.error("Failed to save lead:", error)
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
        })
      }
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save lead",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile</FormLabel>
                <FormControl>
                  <Input placeholder="Enter mobile number" {...field} />
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
                  <Input placeholder="Enter email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter address" {...field} />
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
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter notes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">
          {mode === "create" ? "Create Lead" : "Update Lead"}
        </Button>
      </form>
    </Form>
  )
} 
