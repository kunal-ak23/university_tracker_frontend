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
import { deleteInvoiceTDS } from "@/service/api/invoice-tds"
import { formatDate, formatCurrency } from "@/service/utils"
import { Trash2, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { InvoiceTDS } from "@/types/payment"

interface TDSTableProps {
  tdsEntries: InvoiceTDS[]
  onTDSDeleted: () => void
}

export function TDSTable({ tdsEntries, onTDSDeleted }: TDSTableProps) {
  const { toast } = useToast()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTDSId, setSelectedTDSId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!selectedTDSId) return

    setIsDeleting(true)
    try {
      await deleteInvoiceTDS(selectedTDSId)
      toast({
        title: "Success",
        description: "TDS entry deleted successfully",
      })
      onTDSDeleted()
    } catch (error) {
      console.error("Failed to delete TDS entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete TDS entry",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setSelectedTDSId(null)
    }
  }

  const getStatusColor = (status: string) => {
    return "default"
  }

  if (tdsEntries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No TDS entries found
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Amount</TableHead>
            <TableHead>TDS Rate (%)</TableHead>
            <TableHead>Deduction Date</TableHead>
            <TableHead>Reference Number</TableHead>
            <TableHead>Certificate Type</TableHead>
            <TableHead>Certificate</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tdsEntries.map((tds) => (
            <TableRow key={tds.id}>
              <TableCell className="font-medium">
                {formatCurrency(parseFloat(tds.amount))}
              </TableCell>
              <TableCell>{tds.tds_rate}%</TableCell>
              <TableCell>{formatDate(tds.deduction_date)}</TableCell>
              <TableCell>{tds.reference_number || "-"}</TableCell>
              <TableCell>
                {tds.certificate_type ? (
                  <Badge variant="outline">{tds.certificate_type.replace("_", " ").toUpperCase()}</Badge>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {tds.certificate_document ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(tds.certificate_document, '_blank')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    View
                  </Button>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedTDSId(tds.id)
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
            <AlertDialogTitle>Delete TDS Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this TDS entry? This action cannot be undone.
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

