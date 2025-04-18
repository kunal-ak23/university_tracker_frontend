"use client"

import { ChannelPartner } from "@/types/channel-partner"
import { ChannelPartnerProgram } from "@/types/channel-partner-program"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/service/utils"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getChannelPartnerPrograms } from "@/service/api/channel-partner-programs"
import { useToast } from "@/hooks/use-toast"

interface ChannelPartnersTableProps {
  channelPartners: ChannelPartner[]
}

export function ChannelPartnersTable({ channelPartners }: ChannelPartnersTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [programs, setPrograms] = useState<Record<string, ChannelPartnerProgram[]>>({})

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const data = await getChannelPartnerPrograms()
        const programsByPartner = data.results.reduce((acc, program) => {
          if (!acc[program.channel_partner]) {
            acc[program.channel_partner] = []
          }
          acc[program.channel_partner].push(program)
          return acc
        }, {} as Record<string, ChannelPartnerProgram[]>)
        setPrograms(programsByPartner)
      } catch (error) {
        console.error("Failed to fetch programs:", error)
        toast({
          title: "Error",
          description: "Failed to load partner programs",
          variant: "destructive",
        })
      }
    }

    fetchPrograms()
  }, [toast])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Contact Email</TableHead>
            <TableHead>Commission Rate</TableHead>
            <TableHead>Programs</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {channelPartners.map((partner) => (
            <TableRow 
              key={partner.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => router.push(`/channel-partners/${partner.id}`)}
            >
              <TableCell className="font-medium">{partner.name}</TableCell>
              <TableCell>
                <a 
                  href={partner.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {partner.website}
                </a>
              </TableCell>
              <TableCell>{partner.contact_email}</TableCell>
              <TableCell>{formatCurrency(partner.commission_rate)}%</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {programs[partner.id]?.map((program) => (
                    <Badge 
                      key={program.id}
                      variant={program.status === 'active' ? 'default' : 'secondary'}
                      className="cursor-default"
                    >
                      {program.program}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                  {partner.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 