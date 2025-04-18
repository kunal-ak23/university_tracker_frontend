"use client"

import { useState, useEffect } from "react"
import { ChannelPartnerProgram } from "@/types/channel-partner-program"
import { getChannelPartnerPrograms, deleteChannelPartnerProgram } from "@/service/api/channel-partner-programs"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ChannelPartnerProgramForm } from "./channel-partner-program-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pencil, Trash2 } from "lucide-react"

interface ChannelPartnerProgramsProps {
  channelPartnerId: string
}

export function ChannelPartnerPrograms({ channelPartnerId }: ChannelPartnerProgramsProps) {
  const [programs, setPrograms] = useState<ChannelPartnerProgram[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProgram, setSelectedProgram] = useState<ChannelPartnerProgram | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPrograms()
  }, [channelPartnerId])

  async function fetchPrograms() {
    try {
      setIsLoading(true)
      const data = await getChannelPartnerPrograms({
        channel_partner: channelPartnerId,
        is_active: true
      })
      setPrograms(data.results);
      console.log(data.results);
    } catch (error) {
      console.error("Failed to fetch programs:", error)
      toast({
        title: "Error",
        description: "Failed to load programs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(programId: string) {
    try {
      await deleteChannelPartnerProgram(programId)
      toast({
        title: "Success",
        description: "Program link deleted successfully",
      })
      fetchPrograms()
    } catch (error) {
      console.error("Failed to delete program:", error)
      toast({
        title: "Error",
        description: "Failed to delete program link",
        variant: "destructive",
      })
    }
  }

  function handleEdit(program: ChannelPartnerProgram) {
    setSelectedProgram(program)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div>Loading programs...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Linked Programs</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Link New Program</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedProgram ? "Edit Program Link" : "Link New Program"}
              </DialogTitle>
            </DialogHeader>
            <ChannelPartnerProgramForm
              mode={selectedProgram ? "edit" : "create"}
              channelPartnerId={channelPartnerId}
              program={selectedProgram}
            />
          </DialogContent>
        </Dialog>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No programs linked yet
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>Transfer Price</TableHead>
              <TableHead>Commission Rate</TableHead>
              <TableHead>OEM</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.map((program) => (
              <TableRow key={program.id}>
                <TableCell>{program.program.name}</TableCell>
                <TableCell>{program.transfer_price}</TableCell>
                <TableCell>{program.commission_rate}%</TableCell>
                <TableCell>{program?.program.provider?.name}</TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(program)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(program.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
} 
