"use client"

import { useEffect, useState } from "react"
import { ChannelPartner } from "@/types/channel-partner"
import { ChannelPartnersTable } from "@/components/channel-partners/channel-partners-table"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { getChannelPartners } from "@/service/api/channel-partners"
import { useToast } from "@/hooks/use-toast"

export default function ChannelPartnersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [channelPartners, setChannelPartners] = useState<ChannelPartner[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchChannelPartners() {
      try {
        const data = await getChannelPartners()
        setChannelPartners(data.results)
      } catch (error) {
        console.error("Failed to fetch channel partners:", error)
        toast({
          title: "Error",
          description: "Failed to load channel partners",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchChannelPartners()
  }, [toast])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Channel Partners</h2>
        <Button onClick={() => router.push("/channel-partners/new")}>
          Add Partner
        </Button>
      </div>
      <div className="rounded-lg border p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <ChannelPartnersTable channelPartners={channelPartners} />
        )}
      </div>
    </div>
  )
} 