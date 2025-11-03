"use client"

import { Batch } from "@/types/batch"
import { apiClient } from "./apiClient"
import { BatchFormValues } from "@/components/batches/batch-form"
import { PaginatedResponse } from "@/types/common"

export async function getBatches(url = '/batches/'): Promise<PaginatedResponse<Batch>> {
  return apiClient.fetch(url.startsWith('/') ? url : `/${url}`)
}

export async function getBatchesByStream(streamId: string): Promise<PaginatedResponse<Batch>> {
  return apiClient.fetch(`/batches/?stream=${streamId}`)
}

export async function getBatch(id: string): Promise<Batch> {
  return apiClient.fetch(`/batches/${id}/`)
}

export async function createBatch(data: BatchFormValues): Promise<Batch> {
  return apiClient.fetch('/batches/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateBatch(id: string, data: BatchFormValues): Promise<Batch> {
  return apiClient.fetch(`/batches/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteBatch(id: string): Promise<void> {
  return apiClient.fetch(`/batches/${id}/`, {
    method: 'DELETE',
  })
}

export async function getStreamsWithContracts(universityId: string, year: string): Promise<any[]> {
  return apiClient.fetch(`/batches/streams_with_contracts/?university_id=${universityId}&year=${year}`)
}

export async function getProgramsWithContracts(universityId: string, year: string): Promise<any[]> {
  return apiClient.fetch(`/batches/programs_with_contracts/?university_id=${universityId}&year=${year}`)
}

