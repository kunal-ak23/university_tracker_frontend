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

export interface Contract {
  id: number;
  name: string;
  cost_per_student: string;
  oem_transfer_price: string;
  start_date: string;
  end_date: string;
  status: string;
  notes: string | null;
  tax_rate: TaxRate;
  contract_programs: any[];
  contract_files: ContractFile[];
  streams: Stream[];
  oem: OEM;
  university: University;
  programs: Program[];
  created_at: string;
  updated_at: string;
} 