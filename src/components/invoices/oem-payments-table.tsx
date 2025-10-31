"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { deleteInvoiceOEMPayment } from "@/service/api/invoice-oem-payments"
import { formatDate, formatCurrency } from "@/service/utils"
import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { InvoiceOEMPayment } from "@/types/payment"

interface OEMPaymentsTableProps {
  oemPayments: InvoiceOEMPayment[]
  onPaymentDeleted: () => void
}

export function OEMPaymentsTable({ oemPayments, onPaymentDeleted }: OEMPaymentsTableProps) {
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!selectedPaymentId) return

    setIsDeleting(true)
    try {
      await deleteInvoiceOEMPayment(selectedPaymentId)
      toast({
        title: "Success",
        description: "OEM payment deleted successfully",
      })
      onPaymentDeleted()
    } catch (error) {
      console.error("Failed to delete OEM payment:", error)
      toast({
        title: "Error",
        description: "Failed to delete OEM payment",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setSelectedPaymentId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
        return 'destructive'
      default:
        return 'default'
    }
  }

  if (oemPayments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No OEM payments found
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reference Number</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {oemPayments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">
                {formatCurrency(parseFloat(payment.amount))}
              </TableCell>
              <TableCell>{payment.payment_method.replace("_", " ").toUpperCase()}</TableCell>
              <TableCell>{formatDate(payment.payment_date)}</TableCell>
              <TableCell>
                <Badge variant={getStatusColor(payment.status)}>
                  {payment.status}
                </Badge>
              </TableCell>
              <TableCell>{payment.reference_number || "-"}</TableCell>
              <TableCell>{payment.description || "-"}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPaymentId(payment.id)
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete OEM Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this OEM payment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

