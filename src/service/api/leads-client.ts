"use client"

import { apiClient } from "./apiClient"
import { Lead, CreateLeadData, UpdateLeadData, LeadFilters } from "@/types/lead"

export async function getLeads(filters?: LeadFilters): Promise<{ results: Lead[]; count: number }> {
  const params = new URLSearchParams()
  if (filters?.page) params.append('page', filters.page.toString())
  if (filters?.page_size) params.append('page_size', filters.page_size.toString())
  if (filters?.search) params.append('search', filters.search)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.ordering) params.append('ordering', filters.ordering)

  const queryString = params.toString()
  return apiClient.fetch(`/leads/${queryString ? `?${queryString}` : ''}`)
}

export async function getLead(id: number): Promise<Lead> {
  return apiClient.fetch(`/leads/${id}/`)
}

export async function createLead(data: CreateLeadData): Promise<Lead> {
  return apiClient.fetch('/leads/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateLead(id: number, data: UpdateLeadData): Promise<Lead> {
  return apiClient.fetch(`/leads/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteLead(id: number): Promise<void> {
  return apiClient.fetch(`/leads/${id}/`, {
    method: 'DELETE',
  })
}

