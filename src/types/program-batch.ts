import { Program } from "./program"

export type ProgramBatchStatus = "planned" | "ongoing" | "completed"

export interface ProgramBatch {
  id: number
  program: number
  program_details: Program
  name: string
  start_date: string
  end_date: string
  number_of_students: number
  cost_per_student?: number
  status: ProgramBatchStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateProgramBatchData {
  program: number
  name: string
  start_date: string
  end_date: string
  number_of_students: number
  cost_per_student?: number
  status?: ProgramBatchStatus
  notes?: string
}

export interface UpdateProgramBatchData {
  program?: number
  name?: string
  start_date?: string
  end_date?: string
  number_of_students?: number
  cost_per_student?: number
  status?: ProgramBatchStatus
  notes?: string
} 
