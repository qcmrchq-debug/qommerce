import InvoicesClient from "./InvoicesClient"
import { getInvoices, getClients } from "@/app/actions/invoices"
import { getVendorId } from "@/app/actions/vendors"

export const revalidate = 60

export default async function InvoicesPage() {
  // Resolve vendor id once per navigation (server action)
  const vendorId = await getVendorId()

  const [invoices, clients] = await Promise.all([getInvoices(vendorId), getClients(vendorId)])

  return <InvoicesClient initialInvoices={invoices} initialClients={clients} vendorId={vendorId} />
}
