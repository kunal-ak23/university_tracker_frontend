import { Student } from "@/types/student"
import { apiFetch } from "./fetch"

export async function getStudents(params?: Record<string, string>) {
  const queryParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value)
      }
    })
  }
  
  return apiFetch(`/students/?${queryParams}`, {
    method: 'GET',
  })
}

export async function getStudent(id: string) {
  return apiFetch(`/students/${id}/`, {
    method: 'GET',
  })
}

export async function createStudent(data: Partial<Student>) {
  console.log(data);
  return apiFetch(`/students/`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateStudent(id: string, data: Partial<Student>) {
  return apiFetch(`/students/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteStudent(id: string) {
  return apiFetch(`/students/${id}/`, {
    method: 'DELETE',
  })
} 
