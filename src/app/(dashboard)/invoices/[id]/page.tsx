import { getInvoice } from "@/service/api/invoices"
import { InvoiceDetails } from "@/components/invoices/invoice-details"
import { redirect } from "next/navigation"
import { SessionExpiredError } from "@/service/api/errors"


export default async function InvoiceDetailsPage({ params }: {params: Promise<{
  id: string
}>}) {
  const {id} = await params;
  
  try {
    const invoice = await getInvoice(Number(id))
    
    return (
      <div className="container mx-auto">
          <InvoiceDetails invoice={invoice} />
      </div>
    )
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      redirect('/login?error=session_expired')
    }
    throw error
  }
} 