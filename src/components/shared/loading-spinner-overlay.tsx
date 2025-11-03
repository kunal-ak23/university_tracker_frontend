"use client"

import { Spinner } from "@/components/ui/spinner"
import { useLoading } from "@/hooks/use-loading"

export function LoadingSpinnerOverlay() {
  const { isLoading } = useLoading()

  if (!isLoading) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

