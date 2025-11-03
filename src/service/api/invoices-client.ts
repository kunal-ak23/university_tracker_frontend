"use client"

import { PaginatedResponse } from "@/types/api"
import { Invoice } from "@/types/payment"
import { apiClient } from "./apiClient"
import { postFormDataClient } from "./client-form-data"

interface GetInvoicesParams {
  page?: number
  page_size?: number
  search?: string
  ordering?: string
  billing?: number
}

export async function getInvoices(params: GetInvoicesParams = {}): Promise<PaginatedResponse<Invoice>> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.page_size) searchParams.append('page_size', params.page_size.toString())
  if (params.search) searchParams.append('search', params.search)
  if (params.ordering) searchParams.append('ordering', params.ordering)
  if (params.billing) searchParams.append('billing', params.billing.toString())

  return apiClient.fetch(`/invoices/?${searchParams.toString()}`)
}

export async function getInvoice(id: number): Promise<Invoice> {
  return apiClient.fetch(`/invoices/${id}/`)
}

export async function createInvoice(data: FormData): Promise<Invoice> {
  return postFormDataClient('/invoices/', data, {
    method: 'POST',
  })
}

export async function updateInvoice(id: number, data: FormData): Promise<Invoice> {
  return postFormDataClient(`/invoices/${id}/`, data, {
    method: 'PATCH',
  })
}

export async function deleteInvoice(id: number): Promise<void> {
  return apiClient.fetch(`/invoices/${id}/`, {
    method: 'DELETE',
  })
}

export async function sendInvoice(id: number): Promise<void> {
  return apiClient.fetch(`/invoices/${id}/send/`, {
    method: 'POST',
  })
}

