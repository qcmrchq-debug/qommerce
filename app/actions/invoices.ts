"use server"

import { createClient } from "@/lib/supabase/server"

async function getVendorId(supabase: any, user: any) {
  const { data, error } = await supabase
    .from("vendors")
    .select("vendor_id")
    .eq("email", user.email)
    .single()

  if (error) throw error
  return data.vendor_id
}

export async function getInvoices() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const vendorId = await getVendorId(supabase, user)

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return data
}

export async function deleteInvoice(invoiceId: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const vendorId = await getVendorId(supabase, user)

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("vendor_id", vendorId)

  if (error) throw error
}

export async function createInvoice(formData: {
  customer_name: string
  customer_email: string
  customer_phone?: string
  items: any[]
  subtotal: number
  tax_amount: number
  total_amount: number
  due_date?: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const vendorId = await getVendorId(supabase, user)

  // Generate invoice number
  const { data: lastInvoice } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })
    .limit(1)

  const nextNumber = lastInvoice && lastInvoice.length > 0 
    ? parseInt(lastInvoice[0].invoice_number.split('-')[1]) + 1 
    : 1
  const invoiceNumber = `INV-${nextNumber.toString().padStart(3, '0')}`

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      vendor_id: vendorId,
      invoice_number: invoiceNumber,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone || null,
      items: formData.items,
      subtotal: formData.subtotal,
      tax_amount: formData.tax_amount,
      total_amount: formData.total_amount,
      due_date: formData.due_date || null,
    })
    .select()
    .single()

  if (error) throw error

  return data
}