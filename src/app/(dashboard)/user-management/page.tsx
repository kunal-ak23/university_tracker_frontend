"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2, UserCheck, Building2 } from "lucide-react"
import { getUserManagement, deleteUser } from "@/service/api/user-management"
import { UserManagement } from "@/types/user-management"
import { useToast } from "@/hooks/use-toast"
import UserForm from "./user-form"
import UniversityAssignmentDialog from "./university-assignment-dialog"

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserManagement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null)
  const [showUserForm, setShowUserForm] = useState(false)
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false)
  const { toast } = useToast()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        search: search || undefined,
        is_active: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
        ordering: "-date_joined"
      }
      
      // Handle role filter
      if (roleFilter && roleFilter !== "all") {
        if (roleFilter === "admin") {
          params.is_superuser = true
        } else {
          params.role = roleFilter
        }
      }
      
      const response = await getUserManagement(params)
      setUsers(response.results)
      setTotalCount(response.count)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, search, roleFilter, statusFilter])

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      await deleteUser(userId)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      fetchUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: UserManagement) => {
    setSelectedUser(user)
    setShowUserForm(true)
  }

  const handleAssignUniversities = (user: UserManagement) => {
    setSelectedUser(user)
    setShowAssignmentDialog(true)
  }

  const getRoleBadgeVariant = (role: string | null) => {
    if (!role) return "secondary"
    switch (role) {
      case "admin":
        return "destructive"
      case "provider_poc":
      case "university_poc":
        return "default"
      case "staff":
        return "secondary"
      case "agent":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? "default" : "secondary"
  }

  const totalPages = Math.ceil(totalCount / 20)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users and their university assignments</p>
        </div>
        <Button onClick={() => setShowUserForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage system users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="provider_poc">Provider POC</SelectItem>
                <SelectItem value="university_poc">University POC</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Universities</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.is_superuser ? 'admin' : user.role)}>
                        {user.is_superuser ? 'ADMIN' : (user.role ? user.role.replace('_', ' ').toUpperCase() : 'NO ROLE')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.is_active)}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.role === "staff" ? (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          <span>{user.assigned_universities.length} assigned</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.role === "staff" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAssignUniversities(user)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <UserForm
        user={selectedUser}
        open={showUserForm}
        onOpenChange={setShowUserForm}
        onSuccess={() => {
          setShowUserForm(false)
          setSelectedUser(null)
          fetchUsers()
        }}
      />

      <UniversityAssignmentDialog
        user={selectedUser}
        open={showAssignmentDialog}
        onOpenChange={setShowAssignmentDialog}
        onSuccess={() => {
          setShowAssignmentDialog(false)
          setSelectedUser(null)
          fetchUsers()
        }}
      />
    </div>
  )
}
