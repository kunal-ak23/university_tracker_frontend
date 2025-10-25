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
import { TaxRate } from "@/types"

interface PricingEntry {
  id: string
  program_id: string
  stream_id: string
  year: number
  cost_per_student: string
  oem_transfer_price: string
  tax_rate_id: string
}

interface PricingMatrixProps {
  programs: Array<{ id: string; name: string }>
  streams: Stream[]
  taxRates: TaxRate[]
  startYear: number
  endYear: number
  pricing: PricingEntry[]
  onPricingChange: (pricing: PricingEntry[]) => void
}

export function PricingMatrix({ 
  programs,
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
    setLocalPricing(pricing)
  }, [pricing])

  const generateYears = () => {
    const years = []
    for (let year = startYear; year <= endYear; year++) {
      years.push(year)
    }
    return years
  }

  const getPricingForProgramStreamYear = (programId: string, streamId: string, year: number) => {
    const found = localPricing.find(p => p.program_id === programId && p.stream_id === streamId && p.year === year)
    return found
  }

  const updatePricing = (programId: string, streamId: string, year: number, field: keyof PricingEntry, value: string) => {
    const existingIndex = localPricing.findIndex(p => p.program_id === programId && p.stream_id === streamId && p.year === year)
    
    if (existingIndex >= 0) {
      // Update existing entry
      const updatedPricing = [...localPricing]
      const updatedEntry = { ...updatedPricing[existingIndex], [field]: value }
      
      // Check if the updated field is empty or 0
      const isFieldEmpty = value === '' || value === '0'
      
      if (isFieldEmpty) {
        // Remove the entry if any field becomes empty
        updatedPricing.splice(existingIndex, 1)
      } else {
        // Update the entry
        updatedPricing[existingIndex] = updatedEntry
      }
      
      setLocalPricing(updatedPricing)
      onPricingChange(updatedPricing)
    } else if (value !== '' && value !== '0') {
      // Create new entry only if value is not empty
      const newEntry: PricingEntry = {
        id: `${programId}-${streamId}-${year}-${Date.now()}`,
        program_id: programId,
        stream_id: streamId,
        year,
        cost_per_student: field === 'cost_per_student' ? value : '',
        oem_transfer_price: field === 'oem_transfer_price' ? value : '',
        tax_rate_id: field === 'tax_rate_id' ? value : taxRates[0]?.id.toString() || ''
      }
      const updatedPricing = [...localPricing, newEntry]
      setLocalPricing(updatedPricing)
      onPricingChange(updatedPricing)
    }
  }

  const copyPricingAcrossYears = (programId: string, streamId: string, sourceYear: number) => {
    const sourcePricing = getPricingForProgramStreamYear(programId, streamId, sourceYear)
    if (!sourcePricing) return

    const updatedPricing = [...localPricing]
    generateYears().forEach(year => {
      if (year !== sourceYear) {
        const existingIndex = updatedPricing.findIndex(p => p.program_id === programId && p.stream_id === streamId && p.year === year)
        const newEntry: PricingEntry = {
          id: `${programId}-${streamId}-${year}-${Date.now()}`,
          program_id: programId,
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
      description: `Pricing copied from ${sourceYear} to all other years for this program/stream`,
    })
  }


  const copyPricingAcrossStreams = (programId: string, sourceStreamId: string, year: number) => {
    const sourcePricing = getPricingForProgramStreamYear(programId, sourceStreamId, year)
    if (!sourcePricing) return

    const updatedPricing = [...localPricing]
    streams.forEach(stream => {
      if (stream.id.toString() !== sourceStreamId) {
        const existingIndex = updatedPricing.findIndex(p => p.program_id === programId && p.stream_id === stream.id.toString() && p.year === year)
        const newEntry: PricingEntry = {
          id: `${programId}-${stream.id}-${year}-${Date.now()}`,
          program_id: programId,
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

  const clearPricingForProgramStream = (programId: string, streamId: string) => {
    const updatedPricing = localPricing.filter(p => !(p.program_id === programId && p.stream_id === streamId))
    setLocalPricing(updatedPricing)
    onPricingChange(updatedPricing)
    toast({
      title: "Success",
      description: "Pricing cleared for this program/stream combination",
    })
  }

  const generateEmptyPricingMatrix = () => {
    const newPricing: PricingEntry[] = [...localPricing] // Start with existing pricing
    
    programs.forEach(program => {
      streams.forEach(stream => {
        generateYears().forEach(year => {
          // Check if entry already exists
          const existingEntry = newPricing.find(p => 
            p.program_id === program.id && 
            p.stream_id === stream.id.toString() && 
            p.year === year
          )
          
          // Only add if it doesn't exist
          if (!existingEntry) {
            newPricing.push({
              id: `${program.id}-${stream.id}-${year}-${Date.now()}`,
              program_id: program.id,
              stream_id: stream.id.toString(),
              year,
              cost_per_student: '',
              oem_transfer_price: '',
              tax_rate_id: taxRates[0]?.id.toString() || ''
            })
          }
        })
      })
    })
    
    setLocalPricing(newPricing)
    onPricingChange(newPricing)
    toast({
      title: "Success",
      description: "Empty pricing matrix generated for all program/stream combinations and years",
    })
  }

  const isComplete = () => {
    return programs.every(program => 
      streams.every(stream => 
        generateYears().every(year => {
          const pricing = getPricingForProgramStreamYear(program.id, stream.id.toString(), year)
          return pricing && pricing.cost_per_student && pricing.oem_transfer_price && pricing.tax_rate_id
        })
      )
    )
  }

  const getCompletionPercentage = () => {
    const total = programs.length * streams.length * generateYears().length
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
        <div className="space-y-6">
          {programs.map(program => (
            <div key={program.id} className="border rounded-lg overflow-hidden">
              {/* Program Header */}
              <div className="bg-muted px-4 py-3 border-b">
                <h3 className="font-semibold text-lg">{program.name}</h3>
                <p className="text-sm text-muted-foreground">Program pricing across streams and years</p>
              </div>
              
              {/* Streams Table for this Program */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">Stream</th>
                      {generateYears().map(year => (
                        <th key={year} className="text-center p-3 font-medium min-w-[180px]">
                          {year}
                        </th>
                      ))}
                      <th className="text-center p-3 font-medium w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streams.map(stream => (
                      <tr key={`${program.id}-${stream.id}`} className="border-b hover:bg-muted/30 group">
                        <td className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{stream.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {stream.duration} {stream.duration_unit}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => clearPricingForProgramStream(program.id, stream.id.toString())}
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Clear pricing for this stream"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        {generateYears().map(year => {
                          const pricing = getPricingForProgramStreamYear(program.id, stream.id.toString(), year)
                          return (
                            <td key={year} className="p-3">
                              <div className="space-y-2">
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Cost/Student</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={pricing?.cost_per_student || ''}
                                    onChange={(e) => updatePricing(program.id, stream.id.toString(), year, 'cost_per_student', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">OEM Transfer</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={pricing?.oem_transfer_price || ''}
                                    onChange={(e) => updatePricing(program.id, stream.id.toString(), year, 'oem_transfer_price', e.target.value)}
                                    className="h-8 text-xs"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Tax Rate</Label>
                                  <Select
                                    value={pricing?.tax_rate_id || ''}
                                    onValueChange={(value) => updatePricing(program.id, stream.id.toString(), year, 'tax_rate_id', value)}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue placeholder="Select" />
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
                        <td className="p-3">
                          <div className="flex flex-col gap-1">
                            {generateYears().map(year => {
                              const pricing = getPricingForProgramStreamYear(program.id, stream.id.toString(), year)
                              if (pricing && pricing.cost_per_student && pricing.oem_transfer_price) {
                                return (
                                  <Button
                                    key={year}
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyPricingAcrossYears(program.id, stream.id.toString(), year)}
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
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={generateEmptyPricingMatrix}
            >
              <Plus className="h-3 w-3 mr-1" />
              Generate Price Matrix
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // Copy first year pricing to all years for all program-stream combinations
                programs.forEach(program => {
                  streams.forEach(stream => {
                    const firstYearPricing = getPricingForProgramStreamYear(program.id, stream.id.toString(), startYear)
                    if (firstYearPricing) {
                      copyPricingAcrossYears(program.id, stream.id.toString(), startYear)
                    }
                  })
                })
              }}
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy {startYear} to all years
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // Copy first stream pricing to all streams for all years and programs
                programs.forEach(program => {
                  generateYears().forEach(year => {
                    const firstStreamPricing = getPricingForProgramStreamYear(program.id, streams[0]?.id.toString() || '', year)
                    if (firstStreamPricing) {
                      copyPricingAcrossStreams(program.id, streams[0]?.id.toString() || '', year)
                    }
                  })
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

