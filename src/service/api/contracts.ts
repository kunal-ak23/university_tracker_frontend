import { Contract } from "@/types/contract"
import { apiFetch, postFormData } from "./fetch"
import { PaginatedResponse } from "@/types/common";

interface GetContractsParams {
  page?: number
  search?: string
  page_size?: number
  ordering?: string
  university?: number
}

export async function getContracts(params?: GetContractsParams): Promise<PaginatedResponse<Contract>> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.search) searchParams.append('search', params.search)
  if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
  if (params?.ordering) searchParams.append('ordering', params.ordering)
  if (params?.university) searchParams.append('university', params.university.toString())
  
  const queryString = searchParams.toString()
  const url = `/contracts/${queryString ? `?${queryString}` : ''}`
  return apiFetch(url)
}

export async function getContract(id: string): Promise<Contract> {
  return apiFetch(`/contracts/${id}/`)
}

export async function updateContract(id: string, formData: FormData): Promise<Contract> {
  console.log('🔧 Frontend: updateContract called with ID:', id)
  console.log('🔧 Frontend: FormData keys:', Array.from(formData.keys()))
  console.log('🔧 Frontend: FormData entries:')
  for (const [key, value] of formData.entries()) {
    console.log(`🔧 Frontend: ${key}:`, value)
  }
  
  return postFormData( `/contracts/${id}/`, formData, {
    method: 'PATCH'
  })
}

export async function createContract(formData: FormData): Promise<Contract> {
  return postFormData('/contracts/', formData, {
    method: 'POST'
  })
}

export async function deleteContractFile(fileId: string): Promise<void> {
  return apiFetch(`/contract-files/${fileId}/`, {
    method: 'DELETE',
  })
}

export async function deleteContract(id: string): Promise<void> {
  return apiFetch(`/contracts/${id}/`, {
    method: 'DELETE',
  })
}

export async function archiveContract(id: string): Promise<Contract> {
  const formData = new FormData();
  formData.append('status', 'archived');
  return postFormData(`/contracts/${id}/`,formData,{method: 'PATCH',});
}

export async function getContractPricing(university: string, program: string, stream: string, year: string): Promise<{
  cost_per_student: string;
  oem_transfer_price: string;
  tax_rate: string;
}> {
  const searchParams = new URLSearchParams({
    university,
    program,
    stream,
    year
  });
  
  return apiFetch(`/contracts/pricing/?${searchParams.toString()}`)
}
