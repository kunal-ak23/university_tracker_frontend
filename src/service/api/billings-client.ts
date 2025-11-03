"use client"

import { Billing, BillingCreateInput } from "@/types/billing"
import { PaginatedResponse } from "@/types/common"
import { apiClient } from "./apiClient"

interface GetBillingsParams {
  page?: number
  page_size?: number
  search?: string
  status?: string
  ordering?: string
}

export async function getBillings(params: GetBillingsParams = {}): Promise<PaginatedResponse<Billing>> {
  const searchParams = new URLSearchParams()
  if (params.page) searchParams.append('page', params.page.toString())
  if (params.page_size) searchParams.append('page_size', params.page_size.toString())
  if (params.search) searchParams.append('search', params.search)
  if (params.status) searchParams.append('status', params.status)
  if (params.ordering) searchParams.append('ordering', params.ordering)

  return apiClient.fetch(`/billings/?${searchParams.toString()}`)
}

export async function getBilling(id: string): Promise<Billing> {
  return apiClient.fetch(`/billings/${id}/`)
}

export async function createBilling(data: BillingCreateInput): Promise<Billing> {
  return apiClient.fetch("/billings/", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateBilling(id: string, data: Partial<BillingCreateInput>): Promise<Billing> {
  return apiClient.fetch(`/billings/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

export async function publishBilling(id: string): Promise<void> {
  return apiClient.fetch(`/billings/${id}/publish/`, {
    method: "POST",
  })
}

export async function archiveBilling(id: string): Promise<void> {
  return apiClient.fetch(`/billings/${id}/archive/`, {
    method: "POST",
  })
}

export async function deleteBilling(id: string): Promise<void> {
  return apiClient.fetch(`/billings/${id}/`, {
    method: "DELETE",
  })
}

