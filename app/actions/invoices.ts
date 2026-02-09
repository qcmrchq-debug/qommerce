"use server"

import { createClient } from "@/lib/supabase/server"
import { getVendorId } from "@/app/actions/vendors"
import { markInvoicePaidAndCreateReceipt } from "@/lib/receipt-helpers"


export async function getClients(vendorId?: number) {
  try {
    const supabase = await createClient()
    const id = vendorId ?? (await getVendorId())

    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("vendor_id", id)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching clients:", error)
      throw new Error("Failed to load clients. Please try again.")
    }

    return data || []
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unexpected error occurred while loading clients.")
  }
}

export async function getInvoices(vendorId?: number) {
  try {
    const supabase = await createClient()
    const id = vendorId ?? (await getVendorId())

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("vendor_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching invoices:", error)
      throw new Error("Failed to load invoices. Please try again.")
    }

    return data || []
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unexpected error occurred while loading invoices.")
  }
}

export async function deleteInvoice(invoiceId: number) {
  try {
    const supabase = await createClient()
    const id = await getVendorId()

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoiceId)
      .eq("vendor_id", id)

    if (error) {
      console.error("Error deleting invoice:", error)
      throw new Error("Failed to delete invoice. Please try again.")
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unexpected error occurred while deleting the invoice.")
  }
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
  const id = await getVendorId()

  // Insert invoice and let the DB trigger generate invoice_number atomically
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      vendor_id: id,
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
    .select()
    .single()

  if (error) {
    console.error("Error creating invoice:", error)
    throw new Error("Failed to create invoice. Please check your input and try again.")
  }

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
  const id = await getVendorId()

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
    .eq("vendor_id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating invoice:", error)
    throw new Error("Failed to update invoice. Please check your input and try again.")
  }

  return data
}

export async function markInvoiceAsPaid(invoiceId: number, paymentMethod?: string) {
  const supabase = await createClient()
  const id = await getVendorId()

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("vendor_id", id)
    .single()

  if (invoiceError || !invoice) {
    throw new Error("Invoice not found.")
  }

  const { receipt } = await markInvoicePaidAndCreateReceipt(
    supabase,
    invoiceId,
    id,
    invoice,
    paymentMethod || "bank_transfer"
  )

  return { invoice, receipt }
}

export async function getReceipts(vendorId?: number) {
  try {
    const supabase = await createClient()
    const id = vendorId ?? (await getVendorId())

    const { data, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("vendor_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching receipts:", error)
      throw new Error("Failed to load receipts. Please try again.")
    }

    return data || []
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unexpected error occurred while loading receipts.")
  }
}

export async function getCustomersWithInvoices(vendorId?: number) {
  const supabase = await createClient()
  const id = vendorId ?? (await getVendorId())

  // Get customers for this vendor
  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .eq("vendor_id", id)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching customers:", error)
    throw new Error("Failed to load customers. Please try again.")
  }

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