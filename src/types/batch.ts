import { Contract } from "./contract"
import { Stream } from "./stream"
import { University } from "./university"

export interface BatchSnapshot {
  id: number
  batch: number
  batch_name: string
  batch_stream: string
  batch_university: string
  billing_name: string
  number_of_students: number
  cost_per_student: string
  tax_rate: string
  oem_transfer_price: string
  status: string
  created_at: string
  updated_at: string
}

export interface Batch {
  id: number
  name: string
  status: string
  university: University | number | null
  stream: Stream | number | null
  contract: Contract | number
  number_of_students: number
  start_year: number
  end_year: number
  batch_stream: string
  start_date: string
  end_date: string
  cost_per_student_override: string | null;
  oem_transfer_price_override: string | null;
  notes?: string
  cost_per_student: string
  oem_transfer_price: string
  tax_rate: string
  effective_cost_per_student: string
  effective_oem_transfer_price: string
  effective_tax_rate: string
  tax_rate_override: string | null
  effective_tax_rate_override: string | null
  effective_cost_per_student_override: string | null
  effective_oem_transfer_price_override: string | null
  snapshots?: BatchSnapshot[]
} 