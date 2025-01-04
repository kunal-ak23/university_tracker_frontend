'use client';

import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import ContractForm from '@/components/ContractForm';

export default function CreateContract() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const universityId = parseInt(params.id as string);

  const handleSubmit = async (formData: FormData) => {
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create contract');
      }

      toast({
        title: "Success",
        description: "Contract created successfully",
      });

      // Navigate back to contracts list on success
      router.push(`/universities/${universityId}/contracts`);
    } catch (error) {
      console.error('Error creating contract:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to create contract',
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Contract</h1>
      <ContractForm universityId={universityId} onSubmit={handleSubmit} />
    </div>
  );
} 