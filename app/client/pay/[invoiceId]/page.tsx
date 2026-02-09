import { notFound, redirect } from "next/navigation"
import { getClientInvoiceById } from "@/app/actions/clients"
import PaymentClient from "./PaymentClient"

interface Props {
  params: Promise<{ invoiceId: string }>
}

export default async function PaymentPage({ params }: Props) {
  const { invoiceId } = await params
  const invoiceIdNum = Number(invoiceId)
  
  if (!Number.isInteger(invoiceIdNum)) {
    notFound()
  }

  const invoice = await getClientInvoiceById(invoiceIdNum)
  
  if (!invoice) {
    notFound()
  }

  if (invoice.invoices_status === "paid") {
    redirect(`/client/invoices/${invoiceIdNum}`)
  }

  if (invoice.invoices_status === "payment_pending") {
    redirect(`/client/invoices/${invoiceIdNum}?pending=1`)
  }

  return <PaymentClient invoice={invoice} />
}
