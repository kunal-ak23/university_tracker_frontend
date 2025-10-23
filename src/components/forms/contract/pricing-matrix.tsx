"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Plus, Trash2, Download, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Stream } from "@/types/stream"
import { TaxRate } from "@/types/tax"

interface PricingEntry {
  id: string
  stream_id: string
  year: number
  cost_per_student: string
  oem_transfer_price: string
  tax_rate_id: string
}

interface PricingMatrixProps {
  streams: Stream[]
  taxRates: TaxRate[]
  startYear: number
  endYear: number
  pricing: PricingEntry[]
  onPricingChange: (pricing: PricingEntry[]) => void
}

export function PricingMatrix({ 
  streams, 
  taxRates, 
  startYear, 
  endYear, 
  pricing, 
  onPricingChange 
}: PricingMatrixProps) {
  const { toast } = useToast()
  const [localPricing, setLocalPricing] = useState<PricingEntry[]>(pricing)

  useEffect(() => {
    console.log('PricingMatrix: Received pricing data:', pricing)
    setLocalPricing(pricing)
  }, [pricing])

  const generateYears = () => {
    const years = []
    for (let year = startYear; year <= endYear; year++) {
      years.push(year)
    }
    return years
  }

  const getPricingForStreamYear = (streamId: string, year: number) => {
    return localPricing.find(p => p.stream_id === streamId && p.year === year)
  }

  const updatePricing = (streamId: string, year: number, field: keyof PricingEntry, value: string) => {
    console.log('PricingMatrix: updatePricing called', { streamId, year, field, value })
    const existingIndex = localPricing.findIndex(p => p.stream_id === streamId && p.year === year)
    
    if (existingIndex >= 0) {
      // Update existing entry
      const updatedPricing = [...localPricing]
      const updatedEntry = { ...updatedPricing[existingIndex], [field]: value }
      
      // Check if the updated field is empty or 0
      const isFieldEmpty = value === '' || value === '0'
      
      if (isFieldEmpty) {
        // Remove the entry if any field becomes empty
        updatedPricing.splice(existingIndex, 1)
        console.log('PricingMatrix: Removed entry, new pricing:', updatedPricing)
      } else {
        // Update the entry
        updatedPricing[existingIndex] = updatedEntry
        console.log('PricingMatrix: Updated entry, new pricing:', updatedPricing)
      }
      
      setLocalPricing(updatedPricing)
      onPricingChange(updatedPricing)
    } else if (value !== '' && value !== '0') {
      // Create new entry only if value is not empty
      const newEntry: PricingEntry = {
        id: `${streamId}-${year}-${Date.now()}`,
        stream_id: streamId,
        year,
        cost_per_student: field === 'cost_per_student' ? value : '',
        oem_transfer_price: field === 'oem_transfer_price' ? value : '',
        tax_rate_id: field === 'tax_rate_id' ? value : taxRates[0]?.id.toString() || ''
      }
      const updatedPricing = [...localPricing, newEntry]
      console.log('PricingMatrix: Created new entry, new pricing:', updatedPricing)
      setLocalPricing(updatedPricing)
      onPricingChange(updatedPricing)
    }
  }

  const copyPricingAcrossYears = (streamId: string, sourceYear: number) => {
    const sourcePricing = getPricingForStreamYear(streamId, sourceYear)
    if (!sourcePricing) return

    const updatedPricing = [...localPricing]
    generateYears().forEach(year => {
      if (year !== sourceYear) {
        const existingIndex = updatedPricing.findIndex(p => p.stream_id === streamId && p.year === year)
        const newEntry: PricingEntry = {
          id: `${streamId}-${year}-${Date.now()}`,
          stream_id: streamId,
          year,
          cost_per_student: sourcePricing.cost_per_student,
          oem_transfer_price: sourcePricing.oem_transfer_price,
          tax_rate_id: sourcePricing.tax_rate_id
        }
        
        if (existingIndex >= 0) {
          updatedPricing[existingIndex] = newEntry
        } else {
          updatedPricing.push(newEntry)
        }
      }
    })
    
    setLocalPricing(updatedPricing)
    onPricingChange(updatedPricing)
    toast({
      title: "Success",
      description: `Pricing copied from ${sourceYear} to all other years for this stream`,
    })
  }

  const removeStreamPricing = (streamId: string) => {
    const updatedPricing = localPricing.filter(p => p.stream_id !== streamId)
    setLocalPricing(updatedPricing)
    onPricingChange(updatedPricing)
  }

  const copyPricingAcrossStreams = (sourceStreamId: string, year: number) => {
    const sourcePricing = getPricingForStreamYear(sourceStreamId, year)
    if (!sourcePricing) return

    const updatedPricing = [...localPricing]
    streams.forEach(stream => {
      if (stream.id.toString() !== sourceStreamId) {
        const existingIndex = updatedPricing.findIndex(p => p.stream_id === stream.id.toString() && p.year === year)
        const newEntry: PricingEntry = {
          id: `${stream.id}-${year}-${Date.now()}`,
          stream_id: stream.id.toString(),
          year,
          cost_per_student: sourcePricing.cost_per_student,
          oem_transfer_price: sourcePricing.oem_transfer_price,
          tax_rate_id: sourcePricing.tax_rate_id
        }
        
        if (existingIndex >= 0) {
          updatedPricing[existingIndex] = newEntry
        } else {
          updatedPricing.push(newEntry)
        }
      }
    })
    
    setLocalPricing(updatedPricing)
    onPricingChange(updatedPricing)
    toast({
      title: "Success",
      description: `Pricing copied from ${streams.find(s => s.id.toString() === sourceStreamId)?.name} to all other streams for ${year}`,
    })
  }

  const clearPricingForStream = (streamId: string) => {
    const updatedPricing = localPricing.filter(p => p.stream_id !== streamId)
    setLocalPricing(updatedPricing)
    onPricingChange(updatedPricing)
    toast({
      title: "Success",
      description: "Pricing cleared for this stream",
    })
  }

  const isComplete = () => {
    return streams.every(stream => 
      generateYears().every(year => {
        const pricing = getPricingForStreamYear(stream.id.toString(), year)
        return pricing && pricing.cost_per_student && pricing.oem_transfer_price && pricing.tax_rate_id
      })
    )
  }

  const getCompletionPercentage = () => {
    const total = streams.length * generateYears().length
    const completed = localPricing.filter(p => 
      p.cost_per_student && p.oem_transfer_price && p.tax_rate_id
    ).length
    return Math.round((completed / total) * 100)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pricing Matrix</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isComplete() ? "default" : "secondary"}>
              {getCompletionPercentage()}% Complete
            </Badge>
            {isComplete() && (
              <Badge variant="default">✓ All pricing defined</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Stream</th>
                {generateYears().map(year => (
                  <th key={year} className="text-center p-2 font-medium min-w-[200px]">
                    {year}
                  </th>
                ))}
                <th className="text-center p-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {streams.map(stream => (
                <tr key={stream.id} className="border-b">
                  <td className="p-2 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{stream.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearPricingForStream(stream.id.toString())}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  {generateYears().map(year => {
                    const pricing = getPricingForStreamYear(stream.id.toString(), year)
                    return (
                      <td key={year} className="p-2">
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs">Cost/Student</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={pricing?.cost_per_student || ''}
                              onChange={(e) => updatePricing(stream.id.toString(), year, 'cost_per_student', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">OEM Transfer</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={pricing?.oem_transfer_price || ''}
                              onChange={(e) => updatePricing(stream.id.toString(), year, 'oem_transfer_price', e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Tax Rate</Label>
                            <Select
                              value={pricing?.tax_rate_id || ''}
                              onValueChange={(value) => updatePricing(stream.id.toString(), year, 'tax_rate_id', value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Select tax rate" />
                              </SelectTrigger>
                              <SelectContent>
                                {taxRates.map(rate => (
                                  <SelectItem key={rate.id} value={rate.id.toString()}>
                                    {rate.name} ({rate.rate}%)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </td>
                    )
                  })}
                  <td className="p-2">
                    <div className="flex flex-col gap-1">
                      {generateYears().map(year => {
                        const pricing = getPricingForStreamYear(stream.id.toString(), year)
                        if (pricing && pricing.cost_per_student && pricing.oem_transfer_price) {
                          return (
                            <Button
                              key={year}
                              variant="ghost"
                              size="sm"
                              onClick={() => copyPricingAcrossYears(stream.id.toString(), year)}
                              className="h-6 w-6 p-0"
                              title={`Copy ${year} pricing to all years`}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )
                        }
                        return null
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Copy first year pricing to all years for all streams
                streams.forEach(stream => {
                  const firstYearPricing = getPricingForStreamYear(stream.id.toString(), startYear)
                  if (firstYearPricing) {
                    copyPricingAcrossYears(stream.id.toString(), startYear)
                  }
                })
              }}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy {startYear} to all years
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Copy first stream pricing to all streams for all years
                generateYears().forEach(year => {
                  const firstStreamPricing = getPricingForStreamYear(streams[0]?.id.toString() || '', year)
                  if (firstStreamPricing) {
                    copyPricingAcrossStreams(streams[0]?.id.toString() || '', year)
                  }
                })
              }}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy first stream to all
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

