"use client"

import { apiClient } from "./apiClient"
import { DashboardSummary, RecentInvoice, PaginatedResponse } from "./dashboard"

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return apiClient.fetch('/dashboard/summary/')
}

export async function getRecentInvoices(limit: number = 5, page: number = 1): Promise<PaginatedResponse<RecentInvoice>> {
  const searchParams = new URLSearchParams()
  searchParams.append('limit', limit.toString())
  searchParams.append('page', page.toString())
  
  return apiClient.fetch(`/dashboard/recent_invoices/?${searchParams.toString()}`)
}
