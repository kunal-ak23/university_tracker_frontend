import { apiFetch } from './fetch'
import { UserManagement, UserFormData, UniversityAssignmentData, StaffUniversityAssignment } from '../../types/user-management'

export const getUserManagement = async (params?: {
  page?: number
  page_size?: number
  search?: string
  role?: string
  is_active?: boolean
  is_superuser?: boolean
  ordering?: string
}): Promise<{
  count: number
  next: string | null
  previous: string | null
  results: UserManagement[]
}> => {
  const searchParams = new URLSearchParams()
  
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
  if (params?.search) searchParams.append('search', params.search)
  if (params?.role) searchParams.append('role', params.role)
  if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString())
  if (params?.is_superuser !== undefined) searchParams.append('is_superuser', params.is_superuser.toString())
  if (params?.ordering) searchParams.append('ordering', params.ordering)

  const queryString = searchParams.toString()
  const url = `/user-management/${queryString ? `?${queryString}` : ''}`
  
  return apiFetch(url)
}

export const getUser = async (id: number): Promise<UserManagement> => {
  return apiFetch(`/user-management/${id}/`)
}

export const createUser = async (data: UserFormData): Promise<UserManagement> => {
  return apiFetch('/user-management/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const updateUser = async (id: number, data: Partial<UserFormData>): Promise<UserManagement> => {
  return apiFetch(`/user-management/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export const deleteUser = async (id: number): Promise<void> => {
  return apiFetch(`/user-management/${id}/`, {
    method: 'DELETE',
  })
}

export const assignUniversities = async (userId: number, data: UniversityAssignmentData): Promise<{
  message: string
  assignments: StaffUniversityAssignment[]
}> => {
  return apiFetch(`/user-management/${userId}/assign_universities/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const getAssignedUniversities = async (userId: number): Promise<StaffUniversityAssignment[]> => {
  return apiFetch(`/user-management/${userId}/assigned_universities/`)
}

export const getStaffAssignments = async (params?: {
  page?: number
  page_size?: number
  search?: string
  staff?: number
  university?: number
  ordering?: string
}): Promise<{
  count: number
  next: string | null
  previous: string | null
  results: StaffUniversityAssignment[]
}> => {
  const searchParams = new URLSearchParams()
  
  if (params?.page) searchParams.append('page', params.page.toString())
  if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
  if (params?.search) searchParams.append('search', params.search)
  if (params?.staff) searchParams.append('staff', params.staff.toString())
  if (params?.university) searchParams.append('university', params.university.toString())
  if (params?.ordering) searchParams.append('ordering', params.ordering)

  const queryString = searchParams.toString()
  const url = `/staff-assignments/${queryString ? `?${queryString}` : ''}`
  
  return apiFetch(url)
}

export const createStaffAssignment = async (data: {
  staff: number
  university: number
}): Promise<StaffUniversityAssignment> => {
  return apiFetch('/staff-assignments/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export const deleteStaffAssignment = async (id: number): Promise<void> => {
  return apiFetch(`/staff-assignments/${id}/`, {
    method: 'DELETE',
  })
}
