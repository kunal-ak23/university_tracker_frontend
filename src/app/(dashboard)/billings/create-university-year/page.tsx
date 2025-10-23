"use client"

import { useRouter } from "next/navigation"
import { UniversityYearBillingForm } from "@/components/billings/university-year-billing-form"

export default function CreateUniversityYearBillingPage() {
  const router = useRouter()

  const handleSuccess = (billingId: number) => {
    router.push(`/billings/${billingId}/edit`)
  }

  const handleCancel = () => {
    router.push("/billings")
  }

  return (
    <div className="container mx-auto py-6">
      <UniversityYearBillingForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  )
}
