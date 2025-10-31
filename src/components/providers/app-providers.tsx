"use client"

import { SessionProvider } from "next-auth/react"
import { LoadingProvider } from "@/hooks/use-loading"
import { LoadingSpinnerOverlay } from "@/components/shared/loading-spinner-overlay"

export function AppProviders({ 
  children, 
  session 
}: { 
  children: React.ReactNode
  session: any
}) {
  return (
    <SessionProvider session={session}>
      <LoadingProvider>
        {children}
        <LoadingSpinnerOverlay />
      </LoadingProvider>
    </SessionProvider>
  )
}

