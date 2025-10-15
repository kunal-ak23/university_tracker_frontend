"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Building2, X } from "lucide-react"
import { assignUniversities, getAssignedUniversities } from "@/service/api/user-management"
import { getUniversities } from "@/service/api/universities"
import { UserManagement } from "@/types/user-management"
import { University } from "@/types/university"
import { useToast } from "@/hooks/use-toast"

interface UniversityAssignmentDialogProps {
  user?: UserManagement | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function UniversityAssignmentDialog({
  user,
  open,
  onOpenChange,
  onSuccess
}: UniversityAssignmentDialogProps) {
  const [universities, setUniversities] = useState<University[]>([])
  const [assignedUniversities, setAssignedUniversities] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (open && user) {
      fetchData()
    }
  }, [open, user])

  const fetchData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [universitiesData, assignedData] = await Promise.all([
        getUniversities(),
        getAssignedUniversities(user.id)
      ])
      
      setUniversities(universitiesData.results)
      setAssignedUniversities(assignedData.map(assignment => assignment.university))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUniversityToggle = (universityId: number) => {
    setAssignedUniversities(prev => {
      if (prev.includes(universityId)) {
        return prev.filter(id => id !== universityId)
      } else {
        return [...prev, universityId]
      }
    })
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      await assignUniversities(user.id, {
        university_ids: assignedUniversities
      })
      
      toast({
        title: "Success",
        description: `Successfully assigned ${assignedUniversities.length} universities to ${user.username}`,
      })
      
      onSuccess()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign universities",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredUniversities = universities.filter(university =>
    university.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedUniversities = universities.filter(university =>
    assignedUniversities.includes(university.id)
  )

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Assign Universities to {user.full_name}</DialogTitle>
          <DialogDescription>
            Select universities that this staff user can access and manage
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Search Universities</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search universities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Available Universities</Label>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : filteredUniversities.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No universities found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredUniversities.map((university) => (
                      <div
                        key={university.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                      >
                        <Checkbox
                          id={`university-${university.id}`}
                          checked={assignedUniversities.includes(university.id)}
                          onCheckedChange={() => handleUniversityToggle(university.id)}
                        />
                        <Label
                          htmlFor={`university-${university.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          {university.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selected Universities ({selectedUniversities.length})</Label>
              <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                {selectedUniversities.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No universities selected
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedUniversities.map((university) => (
                      <div
                        key={university.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span className="text-sm">{university.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUniversityToggle(university.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Assignments"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
