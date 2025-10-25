import { Batch } from "@/types/batch"
import { apiFetch } from "./fetch"
import { BatchFormValues } from "@/components/batches/batch-form"
import { PaginatedResponse } from "@/types/common"
import { Stream } from "@/types/stream"
import { Program } from "@/types/program"

export async function getBatches(url = '/batches/'): Promise<PaginatedResponse<Batch>> {
  return apiFetch(url)
}

export async function getBatchesByStream(streamId: string): Promise<PaginatedResponse<Batch>> {
  return apiFetch(`/batches/?stream=${streamId}`)
}

export async function getBatch(id: string): Promise<Batch> {
  return apiFetch(`/batches/${id}/`)
}

export async function createBatch(data: BatchFormValues): Promise<Batch> {
  return apiFetch('/batches/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function updateBatch(id: string, data: BatchFormValues): Promise<Batch> {
  return apiFetch(`/batches/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function deleteBatch(id: string): Promise<void> {
  return apiFetch(`/batches/${id}/`, {
    method: 'DELETE',
  })
}

export async function getStreamsWithContracts(universityId: string, year: string): Promise<Stream[]> {
  return apiFetch(`/batches/streams_with_contracts/?university_id=${universityId}&year=${year}`)
}

export async function getProgramsWithContracts(universityId: string, year: string): Promise<Program[]> {
  return apiFetch(`/batches/programs_with_contracts/?university_id=${universityId}&year=${year}`)
} 