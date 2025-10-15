export interface StaffUniversityAssignment {
  id: number
  staff: number
  staff_details: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
  }
  university: number
  university_details: {
    id: number
    name: string
  }
  assigned_at: string
  assigned_by: number
  assigned_by_details: {
    id: number
    username: string
  }
  created_at: string
  updated_at: string
}

export interface UserManagement {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: 'provider_poc' | 'university_poc' | 'agent' | 'staff' | null
  phone_number?: string
  address?: string
  date_of_birth?: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  last_login?: string
  date_joined: string
  assigned_universities: StaffUniversityAssignment[]
}

export interface UserFormData {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
  role: 'provider_poc' | 'university_poc' | 'agent' | 'staff'
  phone_number?: string
  address?: string
  date_of_birth?: string
  is_active: boolean
  is_superuser: boolean
}

export interface UniversityAssignmentData {
  university_ids: number[]
}
