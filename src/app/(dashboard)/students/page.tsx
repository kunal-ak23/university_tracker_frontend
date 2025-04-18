"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getStudents } from "@/service/api/students"
import { StudentsTable } from "@/components/students/students-table"
import {Student} from "@/types/student";

export default function StudentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortColumn, setSortColumn] = useState<string>()
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>()
  const [enrollmentSource, setEnrollmentSource] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")

  const fetchStudents = async (
    page: number, 
    search?: string,
    ordering?: string,
    enrollment_source?: string,
    status?: string
  ) => {
    try {
      setIsLoading(true)
      const response = await getStudents({ 
        page: page.toString(), 
        search: search || "",
        ordering: ordering || "",
        enrollment_source: enrollment_source === "all" ? "" : enrollment_source || "",
        status: status === "all" ? "" : status || "",
        page_size: "10"
      })
      setStudents(response.results)
      setTotalPages(Math.ceil(response.count / 10))
    } catch (error) {
      console.error('Failed to fetch students:', error)
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const ordering = sortColumn 
      ? `${sortDirection === 'desc' ? '-' : ''}${sortColumn}`
      : undefined
    fetchStudents(
      currentPage, 
      searchQuery, 
      ordering,
      enrollmentSource,
      status
    )
  }, [currentPage, searchQuery, sortColumn, sortDirection, enrollmentSource, status])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleSort = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEnrollmentSourceChange = (value: string) => {
    setEnrollmentSource(value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatus(value)
    setCurrentPage(1)
  }

  if (isLoading && students.length === 0) {
    return <div className="flex items-center justify-center h-24">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <Button onClick={() => router.push('/students/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>
      <StudentsTable 
        students={students}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
        enrollmentSource={enrollmentSource}
        onEnrollmentSourceChange={handleEnrollmentSourceChange}
        status={status}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
} 
