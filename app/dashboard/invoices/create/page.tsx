import CreateInvoiceClient from "./CreateInvoiceClient"
import { getClients } from "@/app/actions/invoices"
import { getVendorId } from "@/app/actions/vendors"
import { createClient } from "@/lib/supabase/server"
import * as z from "zod"

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
})

const invoiceSchema = z.object({
  client_id: z.number().optional(),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: z.string().email("Invalid email"),
  customer_phone: z.string().optional(),
  due_date: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
})

type InvoiceForm = z.infer<typeof invoiceSchema>

interface Client {
  id: number
  name: string
  email: string
  phone: string | null
  company: string | null
}

export default async function CreateInvoicePage() {
  const vendorId = await getVendorId()
  const clients = await getClients(vendorId)

  return <CreateInvoiceClient initialClients={clients} vendorId={vendorId} />
}