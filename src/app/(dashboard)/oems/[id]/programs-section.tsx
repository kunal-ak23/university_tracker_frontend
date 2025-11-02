"use client"

import { useState } from "react"
import { Suspense } from "react"
import { OEMProgramsList } from "./programs-list"
import { AddProgramDialogWrapper } from "./add-program-dialog-wrapper"

interface OEMProgramsSectionProps {
  oemId: number
}

export function OEMProgramsSection({ oemId }: OEMProgramsSectionProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleProgramAdded = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Programs</h3>
        <AddProgramDialogWrapper 
          providerId={oemId}
          onProgramAdded={handleProgramAdded}
        />
      </div>
      <Suspense fallback={<div className="flex items-center justify-center h-24">Loading...</div>}>
        <OEMProgramsList oemId={oemId} refreshTrigger={refreshTrigger} />
      </Suspense>
    </div>
  )
}

