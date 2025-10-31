"use client"

import { apiClient } from "./apiClient"
import { InvoiceOEMPayment } from "@/types/payment"

export interface InvoiceOEMPaymentFormData {
  invoice: number
  amount: string
  payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'online'
  status: 'pending' | 'completed' | 'failed'
  payment_date: string
  reference_number?: string
  description?: string
  notes?: string
}

export async function getInvoiceOEMPayments(invoiceId: number): Promise<InvoiceOEMPayment[]> {
  const response = await apiClient.fetch(`/invoice-oem-payments/?invoice=${invoiceId}`)
  return response.results || []
}

export async function createInvoiceOEMPayment(data: InvoiceOEMPaymentFormData): Promise<InvoiceOEMPayment> {
  return apiClient.fetch("/invoice-oem-payments/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateInvoiceOEMPayment(id: number, data: Partial<InvoiceOEMPaymentFormData>): Promise<InvoiceOEMPayment> {
  return apiClient.fetch(`/invoice-oem-payments/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function deleteInvoiceOEMPayment(id: number): Promise<void> {
  return apiClient.fetch(`/invoice-oem-payments/${id}/`, {
    method: "DELETE",
  })
}

