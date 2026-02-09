import { getInvoices } from "@/app/actions/invoices"
import QRCodesClient from "./QRCodesClient"

export default async function QRCodesPage() {
  const invoices = await getInvoices()
  return <QRCodesClient initialInvoices={invoices} />
}
