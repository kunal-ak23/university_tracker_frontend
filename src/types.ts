export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Program {
  id: number;
  name: string;
  // other fields...
}

export interface Stream {
  id: number;
  name: string;
  // other fields...
}

export interface TaxRate {
  id: number;
  name: string;
  rate: string;
  description: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface ContractFile {
  id: number;
  contract: number;
  file_type: string;
  file: string;
  description: string;
  uploaded_by: number;
}

export interface OEM {
  id: number;
  name: string;
  website: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  poc: number;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface University {
  id: number;
  name: string;
  website: string;
  established_year: number;
  accreditation: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  poc: number;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface ContractStreamPricing {
  id: number;
  program: Program;
  program_id: number;
  stream: Stream;
  stream_id: number;
  year: number;
  cost_per_student: string;
  oem_transfer_price: string;
  tax_rate: TaxRate;
  tax_rate_id: number;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: number;
  name: string;
  start_year: number;
  end_year: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  notes: string | null;
  contract_programs: any[];
  contract_files: ContractFile[];
  stream_pricing: ContractStreamPricing[];
  streams: Stream[];
  oem: OEM;
  university: University;
  programs: Program[];
  created_at: string;
  updated_at: string;
} 