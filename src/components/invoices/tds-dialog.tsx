"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { useToast } from "@/hooks/use-toast"
import { createInvoiceTDS } from "@/service/api/invoice-tds"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/service/utils"

const formSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  tds_rate: z.string().min(1, "TDS rate is required"),
  deduction_date: z.date({
    required_error: "Deduction date is required",
  }),
  reference_number: z.string().optional(),
  certificate_type: z.enum(['form_16a', 'form_16', 'form_26as', 'other']).optional(),
  certificate_document: z.instanceof(File).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
})

interface TDSDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: number
  invoiceAmount: number
  onTDSAdded: () => void
}

export function TDSDialog({
  open,
  onOpenChange,
  invoiceId,
  invoiceAmount,
  onTDSAdded,
}: TDSDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      tds_rate: "",
      deduction_date: new Date(),
      reference_number: "",
      certificate_type: undefined,
      certificate_document: undefined,
      description: "",
      notes: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const amount = parseFloat(values.amount)
    if (amount > invoiceAmount) {
      form.setError("amount", {
        type: "manual",
        message: `TDS amount cannot exceed invoice amount ${invoiceAmount}`,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createInvoiceTDS({
        invoice: invoiceId,
        amount: values.amount,
        tds_rate: values.tds_rate,
        deduction_date: format(values.deduction_date, "yyyy-MM-dd"),
        reference_number: values.reference_number || undefined,
        certificate_type: values.certificate_type,
        certificate_document: values.certificate_document,
        description: values.description || undefined,
        notes: values.notes || undefined,
      })
      toast({
        title: "Success",
        description: "TDS entry created successfully",
      })
      form.reset()
      onTDSAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create TDS entry:", error)
      toast({
        title: "Error",
        description: "Failed to create TDS entry",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add TDS Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tds_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TDS Rate (%) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deduction_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Deduction Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="certificate_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select certificate type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="form_16a">Form 16A</SelectItem>
                        <SelectItem value="form_16">Form 16</SelectItem>
                        <SelectItem value="form_26as">Form 26AS</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="certificate_document"
                render={({ field: { value, onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>Certificate Document</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        {...field}
                        onChange={(e) => {
                          onChange(e.target.files?.[0])
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
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
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <strong>Note:</strong> TDS is deducted at source by the university and paid directly to the government. 
              This amount NEVER hits our account. We can claim TDS back only if our organization has no tax liability 
              or if there is a tax rebate.
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create TDS Entry
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

