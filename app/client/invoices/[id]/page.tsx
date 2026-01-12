import { notFound } from "next/navigation"
import InvoiceDetails from "@/app/dashboard/invoices/[id]/InvoiceDetails"
import { getClientInvoiceById } from "@/app/actions/clients"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientInvoicePage({ params }: Props) {
  const { id } = await params
  const invoiceId = Number(id)
  if (!Number.isInteger(invoiceId)) return notFound()

  const invoice = await getClientInvoiceById(invoiceId)
  if (!invoice) return notFound()

  return (
    <div className="p-6">
      <InvoiceDetails invoice={invoice} />
    </div>
  )
}
