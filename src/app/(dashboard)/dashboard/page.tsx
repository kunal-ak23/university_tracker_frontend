"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, Users, FileText, AlertCircle, Target, TrendingUp, Phone } from "lucide-react"
import { Overview } from "@/components/dashboard/overview"
import { RecentInvoices } from "@/components/dashboard/recent-invoices"
import { RecentPayments } from "@/components/dashboard/recent-payments"
import { OverdueBillings } from "@/components/dashboard/overdue-billings"
import { getDashboardSummary } from "@/service/api/dashboard"
import type { DashboardSummary } from "@/service/api/dashboard"
import { formatCurrency } from "@/service/utils"
import { useSession, signOut } from "next-auth/react"
import { getLeads } from "@/service/api/leads"
import { LeadStatus } from "@/types/lead"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const router = useRouter()
  const [leadStats, setLeadStats] = useState({
    total: 0,
    hot: 0,
    warm: 0,
    cold: 0,
    converted: 0
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        if (session?.user?.role === "agent") {
          // Load lead statistics for agents
          const leadsResponse = await getLeads({ page: 1, page_size: 1000 })
          const leads = leadsResponse.results
          
          setLeadStats({
            total: leads.length,
            hot: leads.filter(l => l.status === "hot").length,
            warm: leads.filter(l => l.status === "warm").length,
            cold: leads.filter(l => l.status === "cold").length,
            converted: leads.filter(l => l.status === "converted").length
          })
        } else {
          // Load regular dashboard summary for other roles
          const data = await getDashboardSummary()
          setSummary(data)
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard data. Please try again later.'
        
        // Check if it's a session expiration error
        if (errorMessage.includes('Refresh token expired') || 
            errorMessage.includes('session expired') ||
            errorMessage.includes('Please login again')) {
          // Sign out and redirect to login
          await signOut({ redirect: true, callbackUrl: '/login?error=session_expired' })
          return
        }
        
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [session?.user?.role, router])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  if (session?.user?.role === "agent") {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Agent Dashboard</h2>
        </div>
        
        {/* Lead Management Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadStats.total}</div>
              <p className="text-xs text-muted-foreground">
                Total leads in your pipeline
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadStats.hot}</div>
              <p className="text-xs text-muted-foreground">
                High priority leads to follow up
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warm Leads</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadStats.warm}</div>
              <p className="text-xs text-muted-foreground">
                Leads requiring regular follow-up
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Converted</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadStats.converted}</div>
              <p className="text-xs text-muted-foreground">
                Successfully converted leads
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => window.location.href = '/leads'}>
            <CardHeader>
              <CardTitle>Recent Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  View and manage your recent leads
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View All Leads
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Track your lead conversion rates and performance
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Regular dashboard for other roles
  if (!summary) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-muted-foreground">No dashboard data available</div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.total_revenue.current)}</div>
            <p className="text-xs text-muted-foreground">
              {summary.total_revenue.percentage_change >= 0 ? '+' : ''}
              {summary.total_revenue.percentage_change.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.active_batches.current}</div>
            <p className="text-xs text-muted-foreground">
              +{summary.active_batches.new_this_month} new this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.pending_invoices.count}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.pending_invoices.total_value)} total value
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.overdue_payments.count}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.overdue_payments.total_value)} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentInvoices />
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentPayments />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overdue Billings</CardTitle>
          </CardHeader>
          <CardContent>
            <OverdueBillings />
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
