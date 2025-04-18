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
import { ChannelPartner } from "@/types/channel-partner"
import { createChannelPartner, updateChannelPartner } from "@/service/api/channel-partners"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getEligiblePOCs, User } from "@/service/api/users"
import { useState, useEffect } from "react"

const channelPartnerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  website: z.string().url("Must be a valid URL"),
  contact_email: z.string().email("Must be a valid email"),
  contact_phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  poc: z.string().min(1, "Point of Contact is required"),
  commission_rate: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid number with up to 2 decimal places")
    .transform(val => parseFloat(val))
    .refine(val => val >= 0 && val <= 100, "Commission rate must be between 0 and 100"),
  status: z.enum(["active", "inactive"]).default("active"),
  notes: z.string().optional().or(z.literal("")),
})

type ChannelPartnerFormValues = z.infer<typeof channelPartnerFormSchema>

interface ChannelPartnerFormProps {
  mode?: 'create' | 'edit'
  channelPartner?: ChannelPartner
}

export function ChannelPartnerForm({ mode = 'create', channelPartner }: ChannelPartnerFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [pocs, setPocs] = useState<User[]>([])

  useEffect(() => {
    async function fetchPOCs() {
      try {
        const eligiblePOCs = await getEligiblePOCs('channel_partner')
        setPocs(eligiblePOCs.results)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to load eligible POCs",
          variant: "destructive",
        })
      }
    }
    fetchPOCs()
  }, [toast])

  const form = useForm<ChannelPartnerFormValues>({
    resolver: zodResolver(channelPartnerFormSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      name: channelPartner?.name || "",
      website: channelPartner?.website || "",
      contact_email: channelPartner?.contact_email || "",
      contact_phone: channelPartner?.contact_phone || "",
      address: channelPartner?.address ?? "",
      poc: channelPartner?.poc?.toString() ?? "",
      commission_rate: channelPartner?.commission_rate || 0,
      status: channelPartner?.status ?? "active",
      notes: channelPartner?.notes ?? "",
    },
  })

  const { isDirty, isValid } = form.formState

  async function onSubmit(data: ChannelPartnerFormValues) {
    try {
      if (mode === 'edit' && channelPartner) {
        await updateChannelPartner(channelPartner.id, data)
        toast({
          title: "Success",
          description: "Channel partner updated successfully",
        })
      } else {
        await createChannelPartner(data)
        toast({
          title: "Success",
          description: "Channel partner created successfully",
        })
      }
      router.push('/channel-partners')
      router.refresh()
    } catch (error) {
      console.error(`Failed to ${mode} channel partner:`, error)
      
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message)
          
          if (typeof errorData === 'object') {
            Object.keys(errorData).forEach((key) => {
              const messages = errorData[key]
              if (Array.isArray(messages)) {
                form.setError(key as keyof ChannelPartnerFormValues, {
                  type: 'server',
                  message: messages.join(', ')
                })
              } else if (typeof messages === 'string') {
                form.setError(key as keyof ChannelPartnerFormValues, {
                  type: 'server',
                  message: messages
                })
              }
            })
          }
          
          const firstError = Object.values(errorData)[0]
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
          
          toast({
            title: "Error",
            description: errorMessage || `Failed to ${mode} channel partner`,
            variant: "destructive",
          })
        } catch {
          toast({
            title: "Error",
            description: error.message || `Failed to ${mode} channel partner`,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to ${mode} channel partner`,
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
                  <Input placeholder="Enter partner name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contact@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} />
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
                  <Input 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="15.00" 
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
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="poc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Point of Contact</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue>
                        {field.value 
                          ? pocs.find(p => p.id.toString() === field.value)?.full_name || "Select a POC" 
                          : "Select a POC"
                        }
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pocs.map((poc) => (
                      <SelectItem 
                        key={poc.id} 
                        value={poc.id.toString()}
                      >
                        {poc.full_name || poc.username}
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
            {mode === 'edit' ? 'Update' : 'Create'} Channel Partner
          </Button>
        </div>
      </form>
    </Form>
  )
} 
