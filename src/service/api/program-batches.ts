import { ProgramBatch, CreateProgramBatchData, UpdateProgramBatchData } from "@/types/program-batch"
import { apiFetch } from "./fetch"
import { PaginatedResponse } from "@/types/common"

export async function getProgramBatches(params?: {
  page?: number
  search?: string
  ordering?: string
  page_size?: number
  program?: number
  status?: string
}): Promise<PaginatedResponse<ProgramBatch>> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", params.page.toString())
  if (params?.search) searchParams.set("search", params.search)
  if (params?.ordering) searchParams.set("ordering", params.ordering)
  if (params?.page_size) searchParams.set("page_size", params.page_size.toString())
  if (params?.program) searchParams.set("program", params.program.toString())
  if (params?.status) searchParams.set("status", params.status)

  const queryString = searchParams.toString()
  const url = `/program-batches/${queryString ? `?${queryString}` : ""}`
  
  return apiFetch(url)
}

export async function getProgramBatch(id: number): Promise<ProgramBatch> {
  return apiFetch(`/program-batches/${id}/`)
}

export async function createProgramBatch(data: CreateProgramBatchData): Promise<ProgramBatch> {
  console.log(data);
  return apiFetch("/program-batches/", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function updateProgramBatch(id: number, data: UpdateProgramBatchData): Promise<ProgramBatch> {
  return apiFetch(`/program-batches/${id}/`, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function deleteProgramBatch(id: number): Promise<void> {
  return apiFetch(`/program-batches/${id}/`, {
    method: "DELETE",
  })
} 
