import { apiFetch } from './fetch'

export interface UniversityEvent {
  id: number
  university: number
  university_details?: {
    id: number
    name: string
  }
  title: string
  description: string
  start_datetime: string
  end_datetime: string
  location: string
  batch?: number
  batch_details?: {
    id: number
    name: string
  }
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_by: number
  created_by_details?: {
    id: number
    username: string
  }
  notes?: string
  invitees?: string
  submitted_for_approval_at?: string
  approved_by?: number
  approved_by_details?: {
    id: number
    username: string
  }
  approved_at?: string
  rejection_reason?: string
  notion_page_id?: string
  notion_page_url?: string
  integration_status: 'pending' | 'notion_created' | 'failed'
  integration_notes?: string
  invitees_list?: string[]
  invitee_emails?: string[]
  can_be_approved: boolean
  can_be_rejected: boolean
  can_be_submitted: boolean
  is_approved: boolean
  is_pending_approval: boolean
  created_at: string
  updated_at: string
}

export interface CreateUniversityEventData {
  university: number
  title: string
  description: string
  start_datetime: string
  end_datetime: string
  location: string
  batch?: number
  notes?: string
  invitees?: string
  created_by?: number
}

export interface UpdateUniversityEventData extends Partial<CreateUniversityEventData> {}

export interface ApprovalData {
  action: 'approve' | 'reject'
  reason?: string
}

export interface InviteeData {
  email: string
  action: 'add' | 'remove'
}

export interface UniversityEventsResponse {
  count: number
  next: string | null
  previous: string | null
  results: UniversityEvent[]
}

// Get all university events
export const getUniversityEvents = async (params?: {
  university?: number
  batch?: number
  status?: string
  search?: string
  page?: number
  page_size?: number
}): Promise<UniversityEventsResponse> => {
  const searchParams = new URLSearchParams()
  if (params?.university) searchParams.append('university', params.university.toString())
  if (params?.batch) searchParams.append('batch', params.batch.toString())
  if (params?.status) searchParams.append('status', params.status)
  if (params?.search) searchParams.append('search', params.search)
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
  
  const queryString = searchParams.toString()
  const url = `/university-events/${queryString ? `?${queryString}` : ''}`
  
  try {
    const response = await apiFetch(url)
    return response
  } catch (error) {
    console.error('Error in getUniversityEvents:', error)
    throw error
  }
}

// Get a single university event
export const getUniversityEvent = async (id: number): Promise<UniversityEvent> => {
  return apiFetch(`/university-events/${id}/`)
}

// Create a new university event
export const createUniversityEvent = async (data: CreateUniversityEventData): Promise<UniversityEvent> => {
  console.log(data);
  return apiFetch('/university-events/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Update a university event
export const updateUniversityEvent = async (id: number, data: UpdateUniversityEventData): Promise<UniversityEvent> => {
  return apiFetch(`/university-events/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

// Delete a university event
export const deleteUniversityEvent = async (id: number): Promise<void> => {
  return apiFetch(`/university-events/${id}/`, {
    method: 'DELETE',
  })
}

// Submit event for approval
export const submitEventForApproval = async (id: number): Promise<{ message: string; status: string }> => {
  return apiFetch(`/university-events/${id}/submit_for_approval/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// Approve or reject event
export const approveEvent = async (id: number, data: ApprovalData): Promise<{ message: string; status: string }> => {
  return apiFetch(`/university-events/${id}/approve/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

// Update event status based on time
export const updateEventStatus = async (id: number): Promise<{ message: string; status: string }> => {
  return apiFetch(`/university-events/${id}/update_status/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

// Get event invitees
export const getEventInvitees = async (id: number): Promise<string[]> => {
  return apiFetch(`/university-events/${id}/invitees/`)
}

// Manage event invitees
export const manageEventInvitees = async (id: number, data: InviteeData): Promise<{ message: string; invitees: string[] }> => {
  return apiFetch(`/university-events/${id}/manage_invitees/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

// Get integration status
export const getEventIntegrationStatus = async (id: number): Promise<{
  integration_status: string
  integration_notes?: string
  outlook_calendar_url?: string
  notion_page_url?: string
}> => {
  return apiFetch(`/university-events/${id}/integration_status/`)
} 
