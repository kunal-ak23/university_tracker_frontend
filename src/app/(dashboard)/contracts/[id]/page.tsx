import { getContract } from "@/service/api/contracts"
import { formatCurrency, formatDate } from "@/service/utils"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText } from "lucide-react"
import { Contract } from "@/types/contract"
import { ContractActions } from "@/components/contracts/contract-actions"

export default async function ContractPage({
  params,
}: Readonly<{
params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  let contract: Contract;

  try {
    contract = await getContract(id);
  } catch (error) {
    console.error(error);
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{contract.name}</h2>
        <ContractActions 
          contractId={id} 
          status={contract.status as 'planned' | 'active' | 'inactive' | 'archived'}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">Contract Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Status</dt>
              <dd>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                  ${contract.status === 'active' ? 'bg-green-100 text-green-800' : 
                    contract.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {contract.status}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Start Year</dt>
              <dd>{contract.start_year}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">End Year</dt>
              <dd>{contract.end_year}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Start Date</dt>
              <dd>{formatDate(contract?.start_date || '')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">End Date</dt>
              <dd>{formatDate(contract?.end_date || '')}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">OEM Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Name</dt>
              <dd>{contract?.oem?.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Website</dt>
              <dd>
                <a href={contract?.oem?.website || ''} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {contract?.oem?.website || ''}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        {contract.contract_programs && contract.contract_programs?.length > 0 && (
          <div className="col-span-2 rounded-lg border p-6 space-y-4">
            <h3 className="text-xl font-semibold">Programs</h3>
            <div className="grid gap-4">
              {contract.contract_programs.map((cp, index) => (
                <div key={"contract" + index} className="rounded border p-4">
                  <h4 className="font-medium">{cp.program.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Code: {cp.program.program_code} | Duration: {cp.program.duration} {cp.program.duration_unit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {contract.stream_pricing && contract.stream_pricing?.length > 0 && (
          <div className="col-span-2 rounded-lg border p-6 space-y-6">
            <h3 className="text-xl font-semibold">Stream Pricing</h3>
            
            {/* Group pricing by program */}
            {(() => {
              // Group pricing by program
              const groupedPricing = contract.stream_pricing.reduce((acc, pricing) => {
                const programId = pricing.program.id;
                if (!acc[programId]) {
                  acc[programId] = {
                    program: pricing.program,
                    streams: {}
                  };
                }
                if (!acc[programId].streams[pricing.stream.id]) {
                  acc[programId].streams[pricing.stream.id] = {
                    stream: pricing.stream,
                    years: {}
                  };
                }
                acc[programId].streams[pricing.stream.id].years[pricing.year] = pricing;
                return acc;
              }, {} as any);

              return Object.values(groupedPricing).map((programData: any) => (
                <div key={programData.program.id} className="border rounded-lg overflow-hidden">
                  {/* Program Header */}
                  <div className="bg-muted px-4 py-3 border-b">
                    <h4 className="font-semibold text-lg">{programData.program.name}</h4>
                    <p className="text-sm text-muted-foreground">Program pricing across streams and years</p>
                  </div>
                  
                  {/* Streams Table for this Program */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">Stream</th>
                          <th className="text-center p-3 font-medium">Year</th>
                          <th className="text-right p-3 font-medium">Cost/Student</th>
                          <th className="text-right p-3 font-medium">Transfer Price</th>
                          <th className="text-center p-3 font-medium">Tax Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.values(programData.streams).map((streamData: any) => 
                          Object.values(streamData.years).map((pricing: any) => (
                            <tr key={`${pricing.program.id}-${pricing.stream.id}-${pricing.year}`} className="border-b hover:bg-muted/30">
                              <td className="p-3">
                                <div>
                                  <div className="font-medium">{pricing.stream.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {pricing.stream.duration} {pricing.stream.duration_unit}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-center">
                                <span className="font-medium">{pricing.year}</span>
                              </td>
                              <td className="p-3 text-right">
                                <span className="font-medium text-green-600">
                                  {formatCurrency(parseFloat(pricing.cost_per_student))}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <span className="font-medium text-blue-600">
                                  {formatCurrency(parseFloat(pricing.oem_transfer_price))}
                                </span>
                              </td>
                              <td className="p-3 text-center">
                                <span className="px-2 py-1 bg-muted rounded text-sm">
                                  {pricing.tax_rate?.rate}%
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {contract.contract_files && contract.contract_files?.length > 0 && (
          <div className="col-span-2 rounded-lg border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Contract Files</h3>
              <Link href={`/contracts/${id}/files`}>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 h-4 w-4" />
                  Manage Files
                </Button>
              </Link>
            </div>
            <div className="grid gap-4">
              {contract.contract_files.map((file, index) => (
                <div key={"file" + index} className="rounded border p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{file.file_type}</h4>
                    {file.description && <p className="text-sm text-muted-foreground">{file.description}</p>}
                  </div>
                  <Link 
                    href={file.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    <Button variant="outline">
                      <ExternalLink className="h-6 w-6 mt-[2px]" />
                      Open in new tab
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
