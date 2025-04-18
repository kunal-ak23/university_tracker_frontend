'use client'

import { Student } from "@/types/student"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

interface StudentsTableProps {
  students: Student[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  onSort: (column: string, direction: 'asc' | 'desc') => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  enrollmentSource: string
  onEnrollmentSourceChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
}

export function StudentsTable({
  students,
  currentPage,
  totalPages,
  onPageChange,
  onSearch,
  onSort,
  sortColumn,
  sortDirection,
  enrollmentSource,
  onEnrollmentSourceChange,
  status,
  onStatusChange,
}: StudentsTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search students..."
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={enrollmentSource}
          onValueChange={onEnrollmentSourceChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Enrollment Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
            <SelectItem value="channel_partner">Channel Partner</SelectItem>
            <SelectItem value="university">University</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={status}
          onValueChange={onStatusChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort('name', sortColumn === 'name' && sortDirection === 'asc' ? 'desc' : 'asc')}
            >
              Name {sortColumn === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => onSort('email', sortColumn === 'email' && sortDirection === 'asc' ? 'desc' : 'asc')}
            >
              Email {sortColumn === 'email' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Enrollment Source</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.phone}</TableCell>
              <TableCell>{student.enrollment_source}</TableCell>
              <TableCell>{student.status}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/students/${student.id}/edit`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {currentPage} of {totalPages} pages
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
} 