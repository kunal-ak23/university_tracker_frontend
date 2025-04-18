import { getChannelPartner } from "@/service/api/channel-partners"
import { ChannelPartnerPrograms } from "@/components/channel-partners/channel-partner-programs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/service/utils"

interface ChannelPartnerPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ChannelPartnerPage({ params }: ChannelPartnerPageProps) {
  const { id } = await params;
  const channelPartner = await getChannelPartner(id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{channelPartner.name}</h1>
        <Badge variant={channelPartner.status === "active" ? "default" : "secondary"}>
          {channelPartner.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{channelPartner.contact_email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p>{channelPartner.contact_phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Website</p>
              <a 
                href={channelPartner.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {channelPartner.website}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Partner Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Default Commission Rate</p>
              <p>{formatCurrency(channelPartner.commission_rate)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p>{new Date(channelPartner.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p>{new Date(channelPartner.updated_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChannelPartnerPrograms channelPartnerId={id} />
    </div>
  )
} 
