"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { FileUpload } from "@/components/ui/file-upload"
import { useState, useEffect } from "react"
import { createContract, updateContract, deleteContract, archiveContract, deleteContractFile } from "@/service/api/contracts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { getUniversities, getUniversityStreams } from "@/service/api/universities"
import { getOEMs, getOEMPrograms } from "@/service/api/oems"
import { getTaxRates } from "@/service/api/tax"
import { TaxRate } from "@/types"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { PricingMatrix } from "./pricing-matrix"
import { Contract, Stream } from "@/types/contract"
import { University } from "@/types/university"
import { OEM } from "@/types/oem"

const contractFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  university: z.union([z.string(), z.number()]).transform(val => val.toString()),
  oem: z.union([z.string(), z.number()]).transform(val => val.toString()),
  start_year: z.string().min(1, "Start year is required"),
  end_year: z.string().min(1, "End year is required"),
  status: z.enum(["active", "planned", "inactive", "archived"]),
  programs: z.array(z.union([z.string(), z.number()])).transform(arr => arr.map(val => val.toString())),
  streams: z.array(z.union([z.string(), z.number()])).transform(arr => arr.map(val => val.toString())).optional(),
  stream_pricing: z.array(z.object({
    program_id: z.string(),
    stream_id: z.string(),
    year: z.number(),
    cost_per_student: z.string(),
    oem_transfer_price: z.string(),
    tax_rate_id: z.string(),
  })).optional(),
})

type ContractFormValues = z.infer<typeof contractFormSchema>

interface ContractFormProps {
  mode?: 'create' | 'edit'
  contract?: Contract
  preSelectedUniversity?: string
}

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Planned", value: "planned" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
] as const

export function ContractForm({ mode = 'create', contract, preSelectedUniversity }: ContractFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [files, setFiles] = useState<File[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [oems, setOems] = useState<OEM[]>([])
  const [availablePrograms, setAvailablePrograms] = useState<Array<{ id: string; name: string }>>([])
  const [availableStreams, setAvailableStreams] = useState<Array<{ id: string; name: string }>>([])
  const [isDirty, setIsDirty] = useState(false)
  const [hasFileChanges, setHasFileChanges] = useState(false)
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [streamPricing, setStreamPricing] = useState<Array<{
    id: string
    program_id: string
    stream_id: string
    year: number
    cost_per_student: string
    oem_transfer_price: string
    tax_rate_id: string
  }>>([])
  const [isPricingInitialized, setIsPricingInitialized] = useState(false)
  const [showPricingMatrix, setShowPricingMatrix] = useState(false)

  const handleStreamPricingChange = (newPricing: Array<{
    id: string
    program_id: string
    stream_id: string
    year: number
    cost_per_student: string
    oem_transfer_price: string
    tax_rate_id: string
  }>) => {
    setStreamPricing(newPricing)
    setIsPricingInitialized(true) // Mark as initialized after user changes
  }

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractFormSchema),
    mode: "all",
    reValidateMode: "onChange",
    defaultValues: {
      name: contract?.name ?? "",
      university: contract?.university?.id?.toString() ?? preSelectedUniversity ?? "",
      oem: contract?.oem?.id?.toString() ?? "",
      start_year: contract?.start_year?.toString() ?? "",
      end_year: contract?.end_year?.toString() ?? "",
      status: contract?.status as "planned" | "active" | "inactive" | "archived" | undefined ?? "planned",
      programs: contract?.programs?.map(cp => cp.id.toString()) ?? [],
      streams: contract?.stream_pricing?.map(sp => sp.stream.id.toString()).filter((id, index, self) => self.indexOf(id) === index) ?? [],
      stream_pricing: contract?.stream_pricing?.map(sp => ({
        program_id: sp.program.id.toString(),
        stream_id: sp.stream.id.toString(),
        year: sp.year,
        cost_per_student: sp.cost_per_student,
        oem_transfer_price: sp.oem_transfer_price,
        tax_rate_id: sp.tax_rate.id.toString(),
      })) ?? [],
    },
  })

  // Update form's stream_pricing field when streamPricing state changes
  useEffect(() => {
    if (streamPricing.length > 0) {
      // Convert program_id to string to match form schema
      const formattedPricing = streamPricing.map(pricing => ({
        ...pricing,
        program_id: pricing.program_id.toString(),
        stream_id: pricing.stream_id.toString(),
        tax_rate_id: pricing.tax_rate_id.toString(),
      }))
      form.setValue('stream_pricing', formattedPricing)
    }
  }, [streamPricing, form])
  

  // Fetch universities and OEMs on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [universitiesData, oemsData, taxRatesData] = await Promise.all([
          getUniversities(),
          getOEMs(),
          getTaxRates()
        ])
        
        setUniversities(universitiesData.results);
        setOems(oemsData.results);
        setTaxRates(taxRatesData.results.map(tax => ({
          id: parseInt(tax.id),
          rate: tax.rate.toString(),
          name: tax.name,
          description: '',
          created_at: '',
          updated_at: '',
          version: 0
        })))

        // Tax rates are now handled at the stream pricing level
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [form, contract])

  // Initialize selected values for edit mode
  useEffect(() => {
    
    async function initializeEditMode() {
      if (mode === 'edit' && contract) {
        try {
          
          if (contract.oem?.id) {
            const programs = await getOEMPrograms(contract.oem.id.toString())
            setAvailablePrograms(programs.results)
          }
          
          if (contract.university?.id) {
            const streams = await getUniversityStreams(contract.university.id.toString())
            // @ts-ignore
            setAvailableStreams(streams.results)
          }

          // Initialize stream pricing data only if not already initialized
          if (contract.stream_pricing && !isPricingInitialized) {
            
            const pricingData = contract.stream_pricing.map(sp => ({
              id: `${sp.program.id}-${sp.stream.id}-${sp.year}-${Date.now()}`,
              program_id: sp.program.id.toString(),
              stream_id: sp.stream.id.toString(),
              year: sp.year,
              cost_per_student: sp.cost_per_student,
              oem_transfer_price: sp.oem_transfer_price,
              tax_rate_id: sp.tax_rate.id.toString(),
            }))
            setStreamPricing(pricingData)
            setIsPricingInitialized(true)
            setShowPricingMatrix(true) // Show pricing matrix in edit mode
            
            // Initialize streams field from stream pricing data (deduplicated)
            const streamIds = contract.stream_pricing.map(sp => sp.stream.id.toString()).filter((id, index, self) => self.indexOf(id) === index)
            form.setValue('streams', streamIds)
            
            // Filter programs and streams to only show those in the contract
            const contractPrograms = contract.stream_pricing.map(sp => ({
              id: sp.program.id.toString(),
              name: sp.program.name
            })).filter((program, index, self) => 
              self.findIndex(p => p.id === program.id) === index
            )
            
            const contractStreams = contract.stream_pricing.map(sp => ({
              id: sp.stream.id.toString(),
              name: sp.stream.name
            })).filter((stream, index, self) => 
              self.findIndex(s => s.id === stream.id) === index
            )
            
            // Set the filtered programs and streams for the pricing matrix
            setAvailablePrograms(contractPrograms)
            setAvailableStreams(contractStreams)
          }
        } catch (error) {
          console.error('Failed to initialize edit mode:', error)
          toast({
            title: "Error",
            description: "Failed to load initial data",
            variant: "destructive",
          })
        }
      }
    }

    initializeEditMode()
  }, [mode, contract, toast, form])

  // Reset pricing initialization when switching modes
  useEffect(() => {
    setIsPricingInitialized(false)
    if (mode === 'edit' && contract?.stream_pricing && contract.stream_pricing.length > 0) {
      setShowPricingMatrix(true)
    }
  }, [mode, contract])

  // Load streams when university is pre-selected
  useEffect(() => {
    if (preSelectedUniversity && mode === 'create') {
      onUniversityChange(preSelectedUniversity)
    }
  }, [preSelectedUniversity, mode])

  // Update available streams when university changes
  const onUniversityChange = async (universityId: string) => {
    try {
      const streams = await getUniversityStreams(universityId)
      // @ts-ignore
      setAvailableStreams(streams.results)
      
      // Only reset streams if we're in create mode or if we don't have existing pricing data
      if (mode === 'create' || !isPricingInitialized) {
        form.setValue('streams', [])
      }
    } catch (error) {
      console.error('Failed to fetch university streams:', error)
      toast({
        title: "Error",
        description: "Failed to load streams for selected university",
        variant: "destructive",
      })
    }
  }

  // Update available programs when OEM changes
  const onOEMChange = async (oemId: string) => {
    try {
      const programs = await getOEMPrograms(oemId)
      
      // In edit mode, only update if we don't have existing pricing data
      if (mode === 'create' || !isPricingInitialized) {
        setAvailablePrograms(programs.results)
        form.setValue('programs', [])
      }
    } catch (error) {
      console.error('Failed to fetch OEM programs:', error)
      toast({
        title: "Error",
        description: "Failed to load programs for selected OEM",
        variant: "destructive",
      })
    }
  }

  // Update the file selection handler
  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles)
    setHasFileChanges(true)
    setIsDirty(true)
  }

  // Track form changes
  useEffect(() => {
    if (mode === 'edit') {
      const subscription = form.watch((value) => {
        const hasFormChanged = Object.entries(value).some(([key, val]) => {
          if (key === 'programs') {
            const currentPrograms = val as string[]
            const originalPrograms = contract?.programs?.map(cp => cp.id.toString()) || []
            return !areArraysEqual(currentPrograms.sort(), originalPrograms.sort())
          }
          if (key === 'streams') {
            const currentStreams = val as string[]
            const originalStreams = contract?.streams?.map(s => s.id.toString()) || []
            return !areArraysEqual(currentStreams.sort(), originalStreams.sort())
          }
          // cost_per_student and oem_transfer_price are now handled at stream pricing level
          // @ts-ignore
          return val !== contract?.[key]?.toString()
        })

        const newIsDirty = hasFormChanged || hasFileChanges
        setIsDirty(newIsDirty)
      })

      return () => subscription.unsubscribe()
    }
  }, [form, mode, contract, hasFileChanges])

  // Helper function to compare arrays
  const areArraysEqual = (arr1: string[], arr2: string[]) => {
    if (arr1.length !== arr2.length) return false
    return arr1.every((value, index) => value === arr2[index])
  }

  async function onSubmit(data: ContractFormValues) {
    try {
      if (files.length === 0 && mode === 'create') {
        toast({
          title: "Error",
          description: "Please upload at least one contract file",
          variant: "destructive",
        })
        return
      }

      const formData = new FormData()
      
      // Add contract data
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'programs') {
            // Convert string IDs back to numbers for programs
            const numericIds = (value as string[]).map(id => parseInt(id))
            // Ensure it's sent as an array even with single value
            numericIds.forEach(id => {
                formData.append('programs_ids[]', id.toString())
            })
        } else if (key === 'streams') {
            // Convert string IDs back to numbers for streams
            const numericIds = (value as string[]).map(id => parseInt(id))
            // Ensure it's sent as an array even with single value
            numericIds.forEach(id => {
                formData.append('streams_ids[]', id.toString())
            })
        } else if (key === 'university' || key === 'oem') {
          // Convert string IDs back to numbers for single values
          formData.append(key, parseInt(value as string).toString())
        } else if (key === 'start_year' || key === 'end_year') {
          formData.append(key, parseInt(value as string).toString())
        } else {
          formData.append(key, value as string)
        }
      })

      // Add stream pricing data
      streamPricing.forEach((pricing, index) => {
        formData.append(`stream_pricing[${index}][program_id]`, pricing.program_id)
        formData.append(`stream_pricing[${index}][stream_id]`, pricing.stream_id)
        formData.append(`stream_pricing[${index}][year]`, pricing.year.toString())
        formData.append(`stream_pricing[${index}][cost_per_student]`, pricing.cost_per_student)
        formData.append(`stream_pricing[${index}][oem_transfer_price]`, pricing.oem_transfer_price)
        formData.append(`stream_pricing[${index}][tax_rate_id]`, pricing.tax_rate_id)
      })

      // Add files only in create mode or if new files are added in edit mode
      if (files.length > 0) {
        files.forEach(file => {
          formData.append('files', file)
        })
      }

      let updatedContract
      if (mode === 'edit' && contract) {
        updatedContract = await updateContract(contract.id, formData)
      } else {
        updatedContract = await createContract(formData)
      }
      
      toast({
        title: "Success",
        description: `Contract ${mode === 'edit' ? 'updated' : 'created'} successfully`,
      })

      router.push(`/contracts/${updatedContract.id}`)
      router.refresh()
    } catch (error) {
      console.error(`Failed to ${mode} contract:`, error)
      
      // Handle server validation errors
      if (error instanceof Error) {
        try {
          const errorData = JSON.parse(error.message)
          
          // Set server-side validation errors in the form
          if (typeof errorData === 'object') {
            Object.keys(errorData).forEach((key) => {
              const messages = errorData[key]
              if (Array.isArray(messages)) {
                form.setError(key as keyof ContractFormValues, {
                  type: 'server',
                  message: messages.join(', ')
                })
              } else if (typeof messages === 'string') {
                form.setError(key as keyof ContractFormValues, {
                  type: 'server',
                  message: messages
                })
              }
            })
          }
          
          // Show a toast with the first error message
          const firstError = Object.values(errorData)[0]
          const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError
          
          toast({
            title: "Error",
            description: errorMessage || `Failed to ${mode} contract`,
            variant: "destructive",
          })
        } catch {
          // If error message isn't JSON, show it directly
          toast({
            title: "Error",
            description: error.message || `Failed to ${mode} contract`,
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Error",
          description: `Failed to ${mode} contract`,
          variant: "destructive",
        })
      }
    }
  }

  // Add delete handler
  const handleDelete = async () => {
    try {
      await deleteContract(contract!.id)
      toast({
        title: "Success",
        description: "Contract deleted successfully",
      })
      router.push('/contracts')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete contract:', error)
      toast({
        title: "Error",
        description: "Failed to delete contract",
        variant: "destructive",
      })
    }
  }

  // Add archive handler
  const handleArchive = async () => {
    try {
      await archiveContract(contract!.id)
      toast({
        title: "Success",
        description: "Contract archived successfully",
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to archive contract:', error)
      toast({
        title: "Error",
        description: "Failed to archive contract",
        variant: "destructive",
      })
    }
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Contract Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter contract name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* OEM and Programs Group */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="oem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OEM</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value)
                      onOEMChange(value)
                    }}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an OEM" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {oems.map((oem) => (
                        <SelectItem key={oem.id} value={oem.id.toString()}>
                          {oem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="programs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Programs</FormLabel>
                  <FormControl>
                    <MultiSelect
                      disabled={!form.getValues("oem")}
                      placeholder={form.getValues("oem") ? "Select programs" : "Select an OEM first"}
                      options={availablePrograms.map(program => ({
                        label: program.name,
                        value: program.id.toString()
                      }))}
                      value={field.value}
                      onValueChange={(values) => {
                        field.onChange(values)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* University and Streams Group */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="university"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>University</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value)
                      onUniversityChange(value)
                    }}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a university" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {universities.map((university) => (
                        <SelectItem 
                          key={university.id} 
                          value={university.id.toString()}
                        >
                          {university.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="streams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Streams</FormLabel>
                  <FormControl>
                    <MultiSelect
                      disabled={!form.getValues("university")}
                      placeholder={form.getValues("university") ? "Select streams" : "Select a university first"}
                      options={availableStreams.map(stream => ({
                        label: stream.name,
                        value: stream.id.toString()
                      }))}
                      value={field.value}
                      onValueChange={(values) => {
                        field.onChange(values)
                        
                        // Remove pricing entries for streams that are no longer selected
                        const previousStreams = field.value || []
                        const removedStreams = previousStreams.filter(streamId => !values.includes(streamId))
                        
                        if (removedStreams.length > 0) {
                          const updatedPricing = streamPricing.filter(p => !removedStreams.includes(p.stream_id))
                          setStreamPricing(updatedPricing)
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>


          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem 
                        key={status.value} 
                        value={status.value}
                        className="capitalize"
                      >
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="2024" 
                    min="2020"
                    max="2030"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Year</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="2025" 
                    min="2020"
                    max="2030"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        {/* Pricing Matrix - Positioned after end year */}
        {form.getValues("university") && form.getValues("start_year") && form.getValues("end_year") && availableStreams.length > 0 && (
          <div className="col-span-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Pricing Configuration</h3>
                {!showPricingMatrix && mode === 'create' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPricingMatrix(true)}
                  >
                    Configure Pricing
                  </Button>
                )}
              </div>
              {showPricingMatrix && (() => {
                // In edit mode, use the contract-specific programs and streams
                // In create mode, filter based on form selections
                let selectedPrograms, selectedStreams
                
                if (mode === 'edit' && contract?.stream_pricing) {
                  // Use contract-specific programs and streams
                  selectedPrograms = contract.stream_pricing.map(sp => ({
                    id: sp.program.id.toString(),
                    name: sp.program.name
                  })).filter((program, index, self) => 
                    self.findIndex(p => p.id === program.id) === index
                  )
                  
                  selectedStreams = contract.stream_pricing.map(sp => ({
                    id: sp.stream.id.toString(),
                    name: sp.stream.name
                  })).filter((stream, index, self) => 
                    self.findIndex(s => s.id === stream.id) === index
                  )
                } else {
                  // Filter based on form selections (create mode)
                  const formProgramIds = form.getValues("programs") || []
                  const formStreamIds = form.getValues("streams") || []
                  
                  selectedPrograms = formProgramIds.length > 0 ? 
                    availablePrograms.filter(p => formProgramIds.includes(p.id.toString())) : 
                    availablePrograms
                  selectedStreams = formStreamIds.length > 0 ? 
                    availableStreams.filter(s => formStreamIds.includes(s.id.toString())) : 
                    availableStreams
                }
                
                const startYear = parseInt(form.getValues("start_year"))
                const endYear = parseInt(form.getValues("end_year"))
                
                return (
                  <PricingMatrix
                    programs={selectedPrograms}
                    streams={selectedStreams.map(s => ({
                      id: s.id,
                      name: s.name,
                      duration: 0,
                      duration_unit: 'Months' as const,
                      university: {} as any,
                      description: '',
                      created_at: '',
                      updated_at: ''
                    }))}
                    taxRates={taxRates}
                    startYear={startYear}
                    endYear={endYear}
                    pricing={streamPricing}
                    onPricingChange={handleStreamPricingChange}
                  />
                )
              })()}
            </div>
          </div>
        )}


        <div className="space-y-4">
          <FormLabel>Contract Files</FormLabel>
          <FileUpload
            onFilesSelected={handleFilesSelected}
            existingFiles={mode === 'edit' ? contract?.contract_files || [] : []}
            onFileRemove={mode === 'edit' ? async (fileId) => {
              try {
                await deleteContractFile(fileId.toString())
                  
                // Update the local state to remove the deleted file
                const updatedFiles = contract?.contract_files.filter(f => f.id !== fileId) || []
                contract!.contract_files = updatedFiles
                
                toast({
                  title: "Success",
                  description: "File deleted successfully",
                })
                setHasFileChanges(true)
                setIsDirty(true)
                router.refresh()
              } catch (error) {
                console.error('Failed to delete file:', error)
                toast({
                  title: "Error",
                  description: "Failed to delete file",
                  variant: "destructive",
                })
              }
            } : undefined}
          />
        </div>

        <div className="flex justify-between gap-4">
          <div className="flex gap-2">
            {mode === 'edit' && (
              <>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Contract
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleArchive}
                >
                  Archive Contract
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={mode === 'edit' && !isDirty}
            >
              {mode === 'edit' ? 'Update' : 'Create'} Contract
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={handleDelete}
          title="Delete Contract"
          description="Are you sure you want to delete this contract? This action cannot be undone."
        />
      </form>
    </Form>
  )
} 
