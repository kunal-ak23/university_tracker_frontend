"use client"

import { useEffect, useState } from "react"
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
import { createInvoiceOEMPayment, updateInvoiceOEMPayment } from "@/service/api/invoice-oem-payments"
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
import { cn, formatCurrency } from "@/service/utils"
import { InvoiceOEMPayment } from "@/types/payment"

const formSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => parseFloat(value) > 0, { message: "Amount must be greater than zero" }),
  payment_method: z.enum(['cash', 'bank_transfer', 'cheque', 'upi', 'online'], {
    required_error: "Payment method is required",
  }),
  status: z.enum(['pending', 'completed', 'failed'], {
    required_error: "Status is required",
  }),
  payment_date: z.date({
    required_error: "Payment date is required",
  }),
  reference_number: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
})

interface OEMPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceId: number
  suggestedAmount?: number
  overpaidAmount?: number
  onPaymentSaved: () => void
  payment?: InvoiceOEMPayment | null
}

export function OEMPaymentDialog({
  open,
  onOpenChange,
  invoiceId,
  suggestedAmount,
  overpaidAmount,
  onPaymentSaved,
  payment,
}: OEMPaymentDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = Boolean(payment)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: suggestedAmount ? String(suggestedAmount) : "",
      payment_method: "bank_transfer",
      status: "pending",
      payment_date: new Date(),
      reference_number: "",
      description: "",
      notes: "",
    },
  })

  useEffect(() => {
    if (!open) {
      return
    }

    if (payment) {
      form.reset({
        amount: payment.amount || "",
        payment_method: payment.payment_method,
        status: payment.status,
        payment_date: payment.payment_date ? new Date(payment.payment_date) : new Date(),
        reference_number: payment.reference_number || "",
        description: payment.description || "",
        notes: payment.notes || "",
      })
    } else {
      form.reset({
        amount: suggestedAmount ? String(suggestedAmount) : "",
        payment_method: "bank_transfer",
        status: "pending",
        payment_date: new Date(),
        reference_number: "",
        description: "",
        notes: "",
      })
    }
  }, [open, payment, suggestedAmount, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    setIsSubmitting(true)
    const payload = {
      amount: values.amount,
      payment_method: values.payment_method,
      status: values.status,
      payment_date: format(values.payment_date, "yyyy-MM-dd"),
      reference_number: values.reference_number || undefined,
      description: values.description || undefined,
      notes: values.notes || undefined,
    }

    try {
      if (isEditMode && payment) {
        await updateInvoiceOEMPayment(payment.id, payload)
      } else {
        await createInvoiceOEMPayment({
          ...payload,
          invoice: invoiceId,
        })
      }
      toast({
        title: "Success",
        description: isEditMode ? "OEM payment updated successfully" : "OEM payment created successfully",
      })
      form.reset()
      onPaymentSaved()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create OEM payment:", error)
      toast({
        title: "Error",
        description: "Failed to create OEM payment",
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
          <DialogTitle>{isEditMode ? "Edit OEM Repayment" : "Add OEM Repayment"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {overpaidAmount && overpaidAmount > 0 && !isEditMode && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                You have already overpaid by {formatCurrency(overpaidAmount)}. Additional OEM payments will
                increase the overpaid balance.
              </div>
            )}
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
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
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
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Payment Date *</FormLabel>
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
                {isEditMode ? "Save Changes" : "Create OEM Payment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

