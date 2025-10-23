import { ContractForm } from "@/components/forms/contract/contract-form"

interface NewContractPageProps {
  searchParams: Promise<{ university?: string }>
}

export default async function NewContractPage({ searchParams }: NewContractPageProps) {
  const { university } = await searchParams
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">New Contract</h2>
      </div>
      <ContractForm preSelectedUniversity={university} />
    </div>
  )
} 