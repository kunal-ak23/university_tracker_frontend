"use client"

import { useState } from "react"
import { Batch } from "@/types/batch"
import { Contract } from "@/types/contract"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, IndianRupee } from "lucide-react"
import Link from "next/link"

interface BatchDetailProps {
  initialBatch: Batch
  initialUniversity: any
}

const BatchDetail = ({ initialBatch, initialUniversity }: BatchDetailProps) => {
  const [batch] = useState<Batch>(initialBatch)
  const [university] = useState(initialUniversity)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'planned':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canCreateOem = batch.number_of_students > 0 && 
    batch?.start_date && 
    batch?.end_date && 
    batch?.effective_cost_per_student && 
    batch?.effective_oem_transfer_price &&
    batch?.effective_tax_rate

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{batch.name}</h2>
          <p className="text-gray-600">Stream: {typeof batch.stream === 'object' && batch.stream ? batch.stream.name : ''}</p>
        </div>
        <div className="flex gap-4">
          <Link href={`/batches/${batch.id}/edit`}>
            <Button>Edit Batch</Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-5 gap-4">
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <h4 className="font-medium">Students</h4>
          </div>
          <p className="text-2xl font-bold">{batch.number_of_students}</p>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <h4 className="font-medium">Duration</h4>
          </div>
          <p className="text-2xl font-bold">{batch.start_year} - {batch.end_year}</p>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <IndianRupee className="h-4 w-4" />
            <h4 className="font-medium">Cost per Student</h4>
          </div>
          <p className="text-2xl font-bold">
            ₹{parseFloat(batch.effective_cost_per_student || '0').toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-500">Automatically calculated from contract pricing</p>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <IndianRupee className="h-4 w-4" />
            <h4 className="font-medium">OEM Transfer Price</h4>
          </div>
          <p className="text-2xl font-bold">
            ₹{parseFloat(batch.effective_oem_transfer_price || '0').toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-gray-500">Automatically calculated from contract pricing</p>
        </div>
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <IndianRupee className="h-4 w-4" />
            <h4 className="font-medium">Tax Rate</h4>
          </div>
          <p className="text-2xl font-bold">
            {(batch.effective_tax_rate || '0')}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">Batch Details</h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Status</dt>
              <dd>
                <Badge className={getStatusColor(batch.status)}>
                  {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Start Date</dt>
              <dd>{new Date(batch.start_date).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">End Date</dt>
              <dd>{new Date(batch.end_date).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        {batch.notes && (
          <div className="rounded-lg border p-6 space-y-4">
            <h3 className="text-xl font-semibold">Notes</h3>
            <p className="whitespace-pre-line">{batch.notes}</p>
          </div>
        )}
      </div>

      {/* Billing History Section */}
      {batch.snapshots && batch.snapshots.length > 0 && (
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">Billing History</h3>
          <p className="text-sm text-gray-600">
            This batch has been included in {batch.snapshots.length} billing cycle(s)
          </p>
          
          <div className="space-y-4">
            {batch.snapshots.map((snapshot, index) => (
              <div key={snapshot.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-lg">{snapshot.billing_name}</h4>
                  <Badge className={getStatusColor(snapshot.status)}>
                    {snapshot.status.charAt(0).toUpperCase() + snapshot.status.slice(1)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Students Billed</p>
                    <p className="font-semibold">{snapshot.number_of_students}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Cost per Student</p>
                    <p className="font-semibold">
                      ₹{parseFloat(snapshot.cost_per_student).toLocaleString('en-IN')}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">OEM Transfer Price</p>
                    <p className="font-semibold">
                      ₹{parseFloat(snapshot.oem_transfer_price).toLocaleString('en-IN')}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Tax Rate</p>
                    <p className="font-semibold">{snapshot.tax_rate}%</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Total Amount (with tax)</p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{(
                          snapshot.number_of_students * 
                          parseFloat(snapshot.cost_per_student) * 
                          (1 + parseFloat(snapshot.tax_rate) / 100)
                        ).toLocaleString('en-IN')}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">OEM Transfer Amount (with tax)</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₹{(
                          snapshot.number_of_students * 
                          parseFloat(snapshot.oem_transfer_price) * 
                          (1 + parseFloat(snapshot.tax_rate) / 100)
                        ).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Snapshot created: {new Date(snapshot.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!batch.snapshots || batch.snapshots.length === 0) && (
        <div className="rounded-lg border p-6 space-y-4">
          <h3 className="text-xl font-semibold">Billing History</h3>
          <p className="text-gray-600">
            This batch has not been included in any billing cycles yet.
          </p>
        </div>
      )}
    </div>
  )
}

export default BatchDetail;