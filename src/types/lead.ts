export type LeadStatus = 'hot' | 'warm' | 'cold' | 'closed' | 'converted' | 'lost' | 'not_interested' | 'all'

export interface Lead {
  id: number
  name: string
  mobile: string
  email: string
  address: string
  status: LeadStatus
  notes: string
  agent: {
    id: number
    name: string
  },
  agent_details: {
    email: string
  }
  assigned_to: {
    id: number
    name: string
  } | null
  created_at: string
  updated_at: string
}

export interface CreateLeadData {
  name: string
  mobile: string
  email: string
  address?: string
  status: LeadStatus
  notes?: string
  assigned_to?: number
}

export interface UpdateLeadData extends Partial<CreateLeadData> {}

export interface LeadFilters {
  search?: string
  status?: LeadStatus
  agent?: number
  assigned_to?: number
  ordering?: string
  page?: number
  page_size?: number
} 
