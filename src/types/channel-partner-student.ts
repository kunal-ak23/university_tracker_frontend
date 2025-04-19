import { Student } from "./student"
import { ChannelPartner } from "./channel-partner"
import { ProgramBatch } from "./program-batch"
import { UniversityBatch } from "./university-batch"

export type ChannelPartnerStudentStatus = "enrolled" | "completed" | "dropped"

export interface ChannelPartnerStudent {
  id: number
  channel_partner: number
  channel_partner_details: ChannelPartner
  program_batch?: number
  program_batch_details?: ProgramBatch
  batch?: number
  batch_details?: UniversityBatch
  student: number
  student_details: Student
  enrollment_date: string
  status: ChannelPartnerStudentStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateChannelPartnerStudentData {
  channel_partner: number
  program_batch?: number
  batch?: number
  student: number
  enrollment_date: string
  status?: ChannelPartnerStudentStatus
  notes?: string
}

export interface UpdateChannelPartnerStudentData {
  status?: ChannelPartnerStudentStatus
  notes?: string
} 