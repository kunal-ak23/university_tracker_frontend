import { Lead, CreateLeadData, UpdateLeadData, LeadFilters } from "@/types/lead"
import { apiFetch } from "./fetch"

export async function getLeads(filters?: LeadFilters): Promise<{ results: Lead[]; count: number }> {
  const queryParams = new URLSearchParams()
  if (filters?.search) queryParams.append('search', filters.search)
  if (filters?.ordering) queryParams.append('ordering', filters.ordering)
  if (filters?.status) queryParams.append('status', filters.status)
  if (filters?.page) queryParams.append('page', filters.page.toString())
  if (filters?.page_size) queryParams.append('page_size', filters.page_size.toString())

  const queryString = queryParams.toString()
  const url = `/leads/${queryString ? `?${queryString}` : ''}`
  
  return apiFetch(url, {
    method: "GET",
  })
}

export async function getLead(id: number): Promise<Lead> {
  return apiFetch(`/leads/${id}/`)
}

export async function createLead(data: CreateLeadData): Promise<Lead> {
  return apiFetch("/leads/", {
    method: "POST",
    body: JSON.stringify(data)
  })
}

export async function updateLead(id: number, data: UpdateLeadData): Promise<Lead> {
  return apiFetch(`/leads/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data)
  })
}

export async function deleteLead(id: number): Promise<void> {
  return apiFetch(`/leads/${id}/`, {
    method: "DELETE"
  })
} 