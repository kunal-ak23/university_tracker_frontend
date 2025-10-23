import { getBatch } from "@/service/api/batches"
import { getUniversity } from "@/service/api/universities"
import BatchDetail from "./batch-detail"
import { notFound } from "next/navigation"

const BatchDetailPage = async ({params}:  {params: Promise<{
  id: string
}>}) => {
  const {id} = await params;
  
  let batch;
  try {
    batch = await getBatch(id);
  } catch (error) {
    console.error('Error fetching batch:', error);
    notFound();
  }
  
  // Only fetch university if batch has one
  let university = null;
  if (batch.university) {
    try {
      // Handle both object and number types for university
      const universityId = typeof batch.university === 'object' ? batch.university.id : batch.university;
      if (universityId && universityId !== null) {
        university = await getUniversity(universityId.toString());
      }
    } catch (error) {
      console.error('Error fetching university:', error);
      university = null;
    }
  }

  return <BatchDetail initialBatch={batch} initialUniversity={university} />  
}

export default BatchDetailPage;
