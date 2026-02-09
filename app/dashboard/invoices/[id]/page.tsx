import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getVendorId } from "@/app/actions/vendors"
import InvoiceDetails from "@/components/invoices/InvoiceDetails"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const vendorId = await getVendorId()

  const { id } = await params
  const invoiceId = Number(id)
  if (!Number.isInteger(invoiceId)) return notFound()

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("vendor_id", vendorId)
    .single()

  if (error || !invoice) return notFound()

  // If items reference products, fetch product names once and merge into items
  try {
    const items = invoice.items || []
    const productIds = Array.from(new Set(items.map((it: any) => it.product_id).filter(Boolean)))
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from("products")
        .select("id,name")
        .in("id", productIds)

      const productMap = new Map((products || []).map((p: any) => [String(p.id), p.name]))

      invoice.items = items.map((it: any) => ({
        ...it,
        name: it.name || productMap.get(String(it.product_id)) || it.name,
      }))
    }
  } catch (e) {
    // If product lookup fails, fall back to existing items
  }

  return (
    <div className="p-6">
      <InvoiceDetails invoice={invoice} userType="vendor" showDownloadButton={true} />
    </div>
  )
}
