'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Program, Stream, TaxRate } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface ContractFormData {
  name: string;
  university: number;
  oem: number;
  cost_per_student: string;
  oem_transfer_price: string;
  tax_rate: number;
  status: string;
  start_date: string;
  end_date: string;
  programs_ids: number[];
  streams_ids: number[];
  files?: FileList;
}

interface ContractFormProps {
  universityId: number;
  onSubmit: (data: FormData) => Promise<void>;
}

export default function ContractForm({ universityId, onSubmit }: ContractFormProps) {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [oems, setOems] = useState<any[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ContractFormData>();

  useEffect(() => {
    // Fetch required data
    const fetchData = async () => {
      try {
        const [programsRes, streamsRes, taxRatesRes, oemsRes] = await Promise.all([
          fetch(`/api/universities/${universityId}/programs`),
          fetch(`/api/universities/${universityId}/streams`),
          fetch('/api/tax-rates'),
          fetch('/api/oems')
        ]);

        const [programsData, streamsData, taxRatesData, oemsData] = await Promise.all([
          programsRes.json(),
          streamsRes.json(),
          taxRatesRes.json(),
          oemsRes.json()
        ]);

        setPrograms(programsData);
        setStreams(streamsData);
        setTaxRates(taxRatesData);
        setOems(oemsData);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    fetchData();
  }, [universityId]);

  const handleFormSubmit = async (data: ContractFormData) => {
    try {
      const formData = new FormData();
      
      // Add all form fields to FormData
      formData.append('name', data.name);
      formData.append('university', universityId.toString());
      formData.append('oem', data.oem.toString());
      formData.append('cost_per_student', data.cost_per_student);
      formData.append('oem_transfer_price', data.oem_transfer_price);
      formData.append('tax_rate', data.tax_rate.toString());
      formData.append('status', data.status);
      formData.append('start_date', data.start_date);
      formData.append('end_date', data.end_date);
      
      // Add arrays with proper format
      data.programs_ids.forEach(programId => {
        formData.append('programs_ids[]', programId.toString());
      });
      
      data.streams_ids.forEach(streamId => {
        formData.append('streams_ids[]', streamId.toString());
      });

      // Add files if present
      if (data.files) {
        Array.from(data.files).forEach(file => {
          formData.append('files', file);
        });
      }

      await onSubmit(formData);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to submit form',
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block mb-1">Contract Name</label>
        <input
          type="text"
          {...register('name', { required: 'Contract name is required' })}
          className="w-full p-2 border rounded"
        />
        {errors.name && <span className="text-red-500">{errors.name.message}</span>}
      </div>

      <div>
        <label className="block mb-1">OEM</label>
        <select
          {...register('oem', { required: 'OEM is required' })}
          className="w-full p-2 border rounded"
        >
          <option value="">Select OEM</option>
          {oems.map(oem => (
            <option key={oem.id} value={oem.id}>{oem.name}</option>
          ))}
        </select>
        {errors.oem && <span className="text-red-500">{errors.oem.message}</span>}
      </div>

      <div>
        <label className="block mb-1">Cost Per Student</label>
        <input
          type="number"
          step="0.01"
          {...register('cost_per_student', { required: 'Cost per student is required' })}
          className="w-full p-2 border rounded"
        />
        {errors.cost_per_student && <span className="text-red-500">{errors.cost_per_student.message}</span>}
      </div>

      <div>
        <label className="block mb-1">OEM Transfer Price</label>
        <input
          type="number"
          step="0.01"
          {...register('oem_transfer_price', { required: 'OEM transfer price is required' })}
          className="w-full p-2 border rounded"
        />
        {errors.oem_transfer_price && <span className="text-red-500">{errors.oem_transfer_price.message}</span>}
      </div>

      <div>
        <label className="block mb-1">Tax Rate</label>
        <select
          {...register('tax_rate', { required: 'Tax rate is required' })}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Tax Rate</option>
          {taxRates.map(rate => (
            <option key={rate.id} value={rate.id}>{rate.name} ({rate.rate}%)</option>
          ))}
        </select>
        {errors.tax_rate && <span className="text-red-500">{errors.tax_rate.message}</span>}
      </div>

      <div>
        <label className="block mb-1">Status</label>
        <select
          {...register('status', { required: 'Status is required' })}
          className="w-full p-2 border rounded"
        >
          <option value="planned">Planned</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        {errors.status && <span className="text-red-500">{errors.status.message}</span>}
      </div>

      <div>
        <label className="block mb-1">Start Date</label>
        <input
          type="date"
          {...register('start_date', { required: 'Start date is required' })}
          className="w-full p-2 border rounded"
        />
        {errors.start_date && <span className="text-red-500">{errors.start_date.message}</span>}
      </div>

      <div>
        <label className="block mb-1">End Date</label>
        <input
          type="date"
          {...register('end_date', { required: 'End date is required' })}
          className="w-full p-2 border rounded"
        />
        {errors.end_date && <span className="text-red-500">{errors.end_date.message}</span>}
      </div>

      <div>
        <label className="block mb-1">Programs</label>
        <select
          multiple
          {...register('programs_ids', { required: 'At least one program is required' })}
          className="w-full p-2 border rounded"
        >
          {programs.map(program => (
            <option key={program.id} value={program.id}>{program.name}</option>
          ))}
        </select>
        {errors.programs_ids && <span className="text-red-500">{errors.programs_ids.message}</span>}
      </div>

      <div>
        <label className="block mb-1">Streams</label>
        <select
          multiple
          {...register('streams_ids', { required: 'At least one stream is required' })}
          className="w-full p-2 border rounded"
        >
          {streams.map(stream => (
            <option key={stream.id} value={stream.id}>{stream.name}</option>
          ))}
        </select>
        {errors.streams_ids && <span className="text-red-500">{errors.streams_ids.message}</span>}
      </div>

      <div>
        <label className="block mb-1">Contract Files</label>
        <input
          type="file"
          multiple
          {...register('files')}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Create Contract
      </button>
    </form>
  );
} 