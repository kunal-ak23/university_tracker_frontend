import { ChannelPartnerProgram } from "@/types/channel-partner-program"
import { apiFetch } from "./fetch"

interface GetChannelPartnerProgramsParams {
  channel_partner?: string
  is_active?: boolean
}

export async function getChannelPartnerPrograms(params?: GetChannelPartnerProgramsParams) {
  const queryParams = new URLSearchParams()
  
  if (params?.channel_partner) {
    queryParams.append('channel_partner', params.channel_partner)
  }
  
  if (params?.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString ? `/channel-partner-programs/?${queryString}` : '/channel-partner-programs/'
  
  return apiFetch(url, {
    method: 'GET',
  })
}

export async function getChannelPartnerProgram(id: string) {
  return apiFetch(`/channel-partner-programs/${id}/`, {
    method: 'GET',
  })
}

export async function createChannelPartnerProgram(data: Partial<ChannelPartnerProgram>) {
  return apiFetch(`/channel-partner-programs/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateChannelPartnerProgram(id: string, data: Partial<ChannelPartnerProgram>) {
  return apiFetch(`/channel-partner-programs/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteChannelPartnerProgram(id: string) {
  return apiFetch(`/channel-partner-programs/${id}/`, {
    method: 'DELETE',
  })
} 
