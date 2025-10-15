"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createUser, updateUser } from "@/service/api/user-management"
import { UserManagement, UserFormData } from "@/types/user-management"
import { useToast } from "@/hooks/use-toast"

interface UserFormProps {
  user?: UserManagement | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function UserForm({ user, open, onOpenChange, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "staff",
    phone_number: "",
    address: "",
    date_of_birth: "",
    is_active: true,
    is_superuser: false,
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: "", // Don't pre-fill password
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role || "staff",
        phone_number: user.phone_number || "",
        address: user.address || "",
        date_of_birth: user.date_of_birth || "",
        is_active: user.is_active,
        is_superuser: user.is_superuser,
      })
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "staff",
        phone_number: "",
        address: "",
        date_of_birth: "",
        is_active: true,
        is_superuser: false,
      })
    }
  }, [user, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || !formData.email || (!user && !formData.password)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      if (user) {
        // Update existing user
        const updateData = { ...formData }
        if (!updateData.password) {
          delete updateData.password
        }
        await updateUser(user.id, updateData)
        toast({
          title: "Success",
          description: "User updated successfully",
        })
      } else {
        // Create new user
        await createUser(formData)
        toast({
          title: "Success",
          description: "User created successfully",
        })
      }
      
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create New User"}</DialogTitle>
          <DialogDescription>
            {user ? "Update user information and permissions" : "Add a new user to the system"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {!user && "*"}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required={!user}
              placeholder={user ? "Leave blank to keep current password" : ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="provider_poc">Provider POC</SelectItem>
                  <SelectItem value="university_poc">University POC</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange("phone_number", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_superuser"
              checked={formData.is_superuser}
              onCheckedChange={(checked) => handleInputChange("is_superuser", checked)}
            />
            <Label htmlFor="is_superuser">Superuser</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : user ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
