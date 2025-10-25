'use server'

import { updateContract } from "@/service/api/contracts"
import { ContractFormData } from "@/types/contract"

export async function handleUpdateContract({ id, formData }: { id: string, formData: ContractFormData }) {
  try {
    const data = new FormData()
    
    // Add basic contract fields
    data.append('name', formData.name)
    data.append('start_year', formData.start_year.toString())
    data.append('end_year', formData.end_year.toString())
    data.append('status', formData.status)
    data.append('oem_id', formData.oem_id.toString())
    data.append('university_id', formData.university_id.toString())
    
    // Add optional fields
    if (formData.start_date) {
      data.append('start_date', formData.start_date)
    }
    if (formData.end_date) {
      data.append('end_date', formData.end_date)
    }
    if (formData.notes) {
      data.append('notes', formData.notes)
    }
    
    // Add array fields
    formData.streams_ids.forEach(id => {
      data.append('streams_ids[]', id.toString())
    })
    formData.programs_ids.forEach(id => {
      data.append('programs_ids[]', id.toString())
    })

    await updateContract(id, data)
  } catch (error) {
    console.error('Failed to update contract:', error)
    throw error
  }
}
