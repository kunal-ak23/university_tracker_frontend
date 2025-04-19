import { ChannelPartnerStudent, CreateChannelPartnerStudentData, UpdateChannelPartnerStudentData } from "@/types/channel-partner-student"
import { apiFetch } from "./fetch"
import { PaginatedResponse } from "@/types/common"

export async function getChannelPartnerStudents(params?: {
  page?: number
  search?: string
  ordering?: string
  page_size?: number
  channel_partner?: number
  program_batch?: number
  batch?: number
  student?: number
  status?: string
}): Promise<PaginatedResponse<ChannelPartnerStudent>> {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", params.page.toString())
  if (params?.search) searchParams.set("search", params.search)
  if (params?.ordering) searchParams.set("ordering", params.ordering)
  if (params?.page_size) searchParams.set("page_size", params.page_size.toString())
  if (params?.channel_partner) searchParams.set("channel_partner", params.channel_partner.toString())
  if (params?.program_batch) searchParams.set("program_batch", params.program_batch.toString())
  if (params?.batch) searchParams.set("batch", params.batch.toString())
  if (params?.student) searchParams.set("student", params.student.toString())
  if (params?.status) searchParams.set("status", params.status)

  const queryString = searchParams.toString()
  const url = `/channel-partner-students/${queryString ? `?${queryString}` : ""}`
  
  return apiFetch(url)
}

export async function getChannelPartnerStudent(id: number): Promise<ChannelPartnerStudent> {
  return apiFetch(`/channel-partner-students/${id}/`)
}

export async function createChannelPartnerStudent(data: CreateChannelPartnerStudentData): Promise<ChannelPartnerStudent> {
  return apiFetch("/channel-partner-students/", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function updateChannelPartnerStudent(id: number, data: UpdateChannelPartnerStudentData): Promise<ChannelPartnerStudent> {
  return apiFetch(`/channel-partner-students/${id}/`, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export async function deleteChannelPartnerStudent(id: number): Promise<void> {
  return apiFetch(`/channel-partner-students/${id}/`, {
    method: "DELETE",
  })
} 