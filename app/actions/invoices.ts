"use server"

import { createClient } from "@/lib/supabase/server"

async function getVendorId(supabase: any, user: any) {
  const { data, error } = await supabase
    .from("vendors")
    .select("vendor_id")
    .eq("email", user.email)
    .single()

  if (error || !data) {
    throw new Error("Vendor account not found. Please ensure you have completed the signup process and that the database tables have been created.")
  }
  return data.vendor_id
}

export async function getClients() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const vendorId = await getVendorId(supabase, user)

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("name", { ascending: true })

  if (error) throw error

  return data
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
  client_id?: number
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
      client_id: formData.client_id || null,
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

export async function updateInvoice(invoiceId: number, formData: {
  client_id?: number
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

  const { data, error } = await supabase
    .from("invoices")
    .update({
      client_id: formData.client_id || null,
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone || null,
      items: formData.items,
      subtotal: formData.subtotal,
      tax_amount: formData.tax_amount,
      total_amount: formData.total_amount,
      due_date: formData.due_date || null,
    })
    .eq("id", invoiceId)
    .eq("vendor_id", vendorId)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function markInvoiceAsPaid(invoiceId: number, paymentMethod?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const vendorId = await getVendorId(supabase, user)

  // Get the invoice details
  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("vendor_id", vendorId)
    .single()

  if (invoiceError || !invoice) throw new Error("Invoice not found")

  // Update invoice status
  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      invoices_status: "paid",
      paid_at: new Date().toISOString(),
      receipt_generated: true
    })
    .eq("id", invoiceId)
    .eq("vendor_id", vendorId)

  if (updateError) throw updateError

  // Generate receipt number
  const { data: lastReceipt } = await supabase
    .from("receipts")
    .select("receipt_number")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })
    .limit(1)

  const nextNumber = lastReceipt && lastReceipt.length > 0 
    ? parseInt(lastReceipt[0].receipt_number.split('-')[1]) + 1 
    : 1
  const receiptNumber = `REC-${nextNumber.toString().padStart(3, '0')}`

  // Create receipt
  const { data: receipt, error: receiptError } = await supabase
    .from("receipts")
    .insert({
      vendor_id: vendorId,
      invoice_id: invoiceId,
      client_id: invoice.client_id,
      receipt_number: receiptNumber,
      customer_name: invoice.customer_name,
      customer_email: invoice.customer_email,
      customer_phone: invoice.customer_phone,
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax_amount: invoice.tax_amount,
      total_amount: invoice.total_amount,
      amount_paid: invoice.total_amount,
      payment_method: paymentMethod || "bank_transfer",
      currency: invoice.currency,
      payment_date: new Date().toISOString(),
    })
    .select()
    .single()

  return { invoice, receipt }
}

export async function getReceipts() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const vendorId = await getVendorId(supabase, user)

  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return data
}

export async function getCustomersWithInvoices() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const vendorId = await getVendorId(supabase, user)

  // Get customers for this vendor
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .eq("vendor_id", vendorId)
    .order("name", { ascending: true })

  if (error) throw error

  // For each customer, we could potentially link to clients/invoices
  // but since there's no direct relationship, we'll return all customers
  // with placeholder stats for now
  const customersWithStats = customers.map(customer => ({
    ...customer,
    invoice_count: 0, // Placeholder - would need proper linking
    receipt_count: 0, // Placeholder - would need proper linking
    total_spent: 0,   // Placeholder - would need proper linking
  }))

  return customersWithStats
}