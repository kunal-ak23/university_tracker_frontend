"use client"

import { apiClient } from "./apiClient"
import { InvoiceTDS } from "@/types/payment"
import { postFormDataClient } from "./client-form-data"

export interface InvoiceTDSFormData {
  invoice: number
  amount: string
  tds_rate: string
  deduction_date: string
  reference_number?: string
  certificate_type?: 'form_16a' | 'form_16' | 'form_26as' | 'other'
  certificate_document?: File
  description?: string
  notes?: string
}

export async function getInvoiceTDSEntries(invoiceId: number): Promise<InvoiceTDS[]> {
  const response = await apiClient.fetch(`/invoice-tds/?invoice=${invoiceId}`)
  return response.results || []
}

export async function createInvoiceTDS(data: InvoiceTDSFormData): Promise<InvoiceTDS> {
  const formData = new FormData()
  formData.append('invoice', data.invoice.toString())
  formData.append('amount', data.amount)
  formData.append('tds_rate', data.tds_rate)
  formData.append('deduction_date', data.deduction_date)
  if (data.reference_number) formData.append('reference_number', data.reference_number)
  if (data.certificate_type) formData.append('certificate_type', data.certificate_type)
  if (data.certificate_document) formData.append('certificate_document', data.certificate_document)
  if (data.description) formData.append('description', data.description)
  if (data.notes) formData.append('notes', data.notes)

  return postFormDataClient('/invoice-tds/', formData, {
    method: 'POST',
  })
}

export async function updateInvoiceTDS(id: number, data: Partial<InvoiceTDSFormData>): Promise<InvoiceTDS> {
  const formData = new FormData()
  if (data.amount) formData.append('amount', data.amount)
  if (data.tds_rate) formData.append('tds_rate', data.tds_rate)
  if (data.deduction_date) formData.append('deduction_date', data.deduction_date)
  if (data.reference_number !== undefined) formData.append('reference_number', data.reference_number || '')
  if (data.certificate_type) formData.append('certificate_type', data.certificate_type)
  if (data.certificate_document) formData.append('certificate_document', data.certificate_document)
  if (data.description !== undefined) formData.append('description', data.description || '')
  if (data.notes !== undefined) formData.append('notes', data.notes || '')

  return postFormDataClient(`/invoice-tds/${id}/`, formData, {
    method: 'PATCH',
  })
}

export async function deleteInvoiceTDS(id: number): Promise<void> {
  return apiClient.fetch(`/invoice-tds/${id}/`, {
    method: "DELETE",
  })
}

