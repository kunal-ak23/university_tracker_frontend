import { getProgramBatches } from "@/service/api/program-batches"
import { ProgramBatchesTable } from "@/components/program-batches/program-batches-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function ProgramBatchesPage() {
  const data = await getProgramBatches()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Program Batches</h2>
        <Button asChild>
          <Link href="/program-batches/new">
            <Plus className="mr-2 h-4 w-4" />
            New Batch
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <ProgramBatchesTable programBatches={data.results} />
      </div>
    </div>
  )
} 