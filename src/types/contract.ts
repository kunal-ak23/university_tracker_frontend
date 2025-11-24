import {z} from "zod";
import { Program } from "./program";
import { TaxRate } from "@/types";
export interface ContractProgram {
  id: number
  program: Program
}

export interface ContractFile {
  id: number
  contract: number
  file_type: string
  file: string
  description: string
  uploaded_by: number
}

export interface Stream {
  id: number
  name: string
  duration: number
  duration_unit: string
  description: string
}

export interface OEM {
  id: number
  name: string
  website: string
  contact_email: string
  contact_phone: string
  address: string
}

export interface University {
  id: number
  name: string
  website: string
  established_year: number
  accreditation: string
  contact_email: string
  contact_phone: string
  address: string
}

export interface ContractStreamPricing {
  id: number
  program: Program
  program_id: number
  stream: Stream
  stream_id: number
  year: number
  cost_per_student: string
  oem_transfer_price: string
  tax_rate: TaxRate
  tax_rate_id: number
  created_at: string
  updated_at: string
}

export interface Contract {
  id: string
  name: string
  start_year: number
  end_year: number
  start_date: string | null
  end_date: string | null
  status: string | "planned" | "active" | "inactive" | "archived"
  notes: string | null
  contract_programs: ContractProgram[]
  contract_files: ContractFile[]
  stream_pricing: ContractStreamPricing[]
  streams: Stream[]
  oem: OEM | null
  university: University | null
  programs: Program[]
}

export const contractFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(100, "Contract name must be 100 characters or fewer"),
  start_year: z.number().min(2020, "Start year must be 2020 or later"),
  end_year: z.number().min(2020, "End year must be 2020 or later"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["planned", "active", "inactive", "archived"], {
    required_error: "Please select a status",
  }),
  oem_id: z.number(),
  university_id: z.number(),
  streams_ids: z.array(z.number()).refine(
    (streams) => streams.length > 0,
    { message: "Please select at least one stream" }
  ),
  programs_ids: z.array(z.number()).refine(
    (programs) => programs.length > 0,
    { message: "Please select at least one program" }
  )
})

export type ContractFormData = z.infer<typeof contractFormSchema>
