"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { ChannelPartnerProgram } from "@/types/channel-partner-program"
import { createChannelPartnerProgram, updateChannelPartnerProgram } from "@/service/api/channel-partner-programs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getPrograms } from "@/service/api/programs"
import { useState, useEffect } from "react"
import { Program } from "@/types/program"

const channelPartnerProgramSchema = z.object({
  channel_partner_id: z.string().min(1, "Channel Partner is required"),
  program_id: z.string().min(1, "Program is required"),
  transfer_price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid number with up to 2 decimal places")
    .transform(val => parseFloat(val))
    .refine(val => val >= 0, "Transfer price must be greater than or equal to 0"),
  commission_rate: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Must be a valid number with up to 2 decimal places")
    .transform(val => parseFloat(val))
    .refine(val => val >= 0 && val <= 100, "Commission rate must be between 0 and 100"),
  status: z.enum(["active", "inactive"]).default("active"),
})

type ChannelPartnerProgramFormValues = z.infer<typeof channelPartnerProgramSchema>

interface ChannelPartnerProgramFormProps {
  mode?: 'create' | 'edit'
  channelPartnerId: string
  program?: ChannelPartnerProgram
}

export function ChannelPartnerProgramForm({ 
  mode = 'create', 
  channelPartnerId,
  program 
}: ChannelPartnerProgramFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([])

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const data = await getPrograms()
        setAvailablePrograms(data.results)
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "Failed to load programs",
          variant: "destructive",
        })
      }
    }
    fetchPrograms()
  }, [toast])

  const form = useForm<ChannelPartnerProgramFormValues>({
    resolver: zodResolver(channelPartnerProgramSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      channel_partner_id: channelPartnerId,
      program_id: (program?.program as Program).id.toString() ?? "",
      transfer_price: program?.transfer_price ?? 0,
      commission_rate: program?.commission_rate ?? 0,
      status: program?.status ?? "active",
    },
  })

  const { isDirty, isValid } = form.formState

  async function onSubmit(data: ChannelPartnerProgramFormValues) {
    try {
      if (mode === 'edit' && program) {
        await updateChannelPartnerProgram(program.id, data)
        toast({
          title: "Success",
          description: "Program link updated successfully",
        })
      } else {
        await createChannelPartnerProgram(data)
        toast({
          title: "Success",
          description: "Program linked successfully",
        })
      }
      router.refresh()
    } catch (error) {
      console.error(`Failed to ${mode} program link:`, error)
      
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message)
          
          if (typeof errorData === 'object') {
            Object.keys(errorData).forEach((key) => {
              const messages = errorData[key]
              if (Array.isArray(messages)) {
                form.setError(key as keyof ChannelPartnerProgramFormValues, {
                  type: 'server',
                  message: messages.join(', ')
                })
              } else if (typeof messages === 'string') {
                form.setError(key as keyof ChannelPartnerProgramFormValues, {
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
            description: errorMessage || `Failed to ${mode} program link`,
            variant: "destructive",
          })
        } catch {
          toast({
            title: "Error",
            description: error.message || `Failed to ${mode} program link`,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to ${mode} program link`,
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="program_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availablePrograms.map((program) => (
                    <SelectItem 
                      key={program.id} 
                      value={program.id.toString()}
                    >
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
          name="transfer_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transfer Price</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  min="0"
                  placeholder="0.00" 
                  {...field}
                />
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

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={mode === 'edit' ? (!isDirty || !isValid) : !isValid}
          >
            {mode === 'edit' ? 'Update' : 'Link'} Program
          </Button>
        </div>
      </form>
    </Form>
  )
} 
