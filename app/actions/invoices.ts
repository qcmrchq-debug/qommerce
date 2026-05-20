"use server"

import { createClient } from "@/lib/supabase/server"
import { getVendorId } from "@/app/actions/vendors"
import { markInvoicePaidAndCreateReceipt } from "@/lib/receipt-helpers"
import { sendInvoiceCreatedEmail, sendPaymentConfirmedEmail } from "@/app/actions/email"


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

export async function getInvoiceById(invoiceId: number) {
  try {
    const supabase = await createClient()
    const id = await getVendorId()

    const { data, error } = await supabase
      .from("invoices")
      .select("*, vendors!inner(name, email, phone, address, tax_number, banking_details, mobile_money)")
      .eq("id", invoiceId)
      .eq("vendor_id", id)
      .single()

    if (error) {
      console.error("Error fetching invoice:", error)
      throw new Error("Failed to load invoice. Please try again.")
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unexpected error occurred while loading the invoice.")
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

  try {
    await sendInvoiceCreatedEmail(String(data.id))
  } catch (error) {
    console.error("Invoice created but failed to send email:", error)
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

  try {
    await sendPaymentConfirmedEmail(String(invoiceId))
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error)
  }

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

export type CustomerSummary = {
  customer_name: string
  customer_email: string
  total_outstanding: number
  total_paid: number
  invoice_count: number
  unpaid_count: number
  most_overdue_days: number
  currency: string
}

export async function getCustomerSummaries(vendorId?: number) {
  try {
    const supabase = await createClient()
    const id = vendorId ?? (await getVendorId())

    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("customer_name, customer_email, total_amount, due_date, currency, invoices_status")
      .eq("vendor_id", id)

    if (error) {
      console.error("Error fetching invoices for customer summaries:", error)
      throw new Error("Failed to load customer summaries. Please try again.")
    }

    const today = new Date()

    const summaries = invoices?.reduce<Record<string, CustomerSummary>>((acc, invoice) => {
      if (!invoice.customer_email) {
        return acc
      }

      const email = invoice.customer_email.toLowerCase()
      const isPaid = invoice.invoices_status === "paid"
      const isUnpaid = !isPaid
      const invoiceAmount = Number(invoice.total_amount) || 0
      const overdueDays = invoice.due_date
        ? Math.max(
            0,
            Math.floor((today.getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)),
          )
        : 0
      const overdueValue = isUnpaid ? overdueDays : 0

      if (!acc[email]) {
        acc[email] = {
          customer_name: invoice.customer_name || invoice.customer_email,
          customer_email: invoice.customer_email,
          total_outstanding: isUnpaid ? invoiceAmount : 0,
          total_paid: isPaid ? invoiceAmount : 0,
          invoice_count: 1,
          unpaid_count: isUnpaid ? 1 : 0,
          most_overdue_days: Math.max(0, overdueValue),
          currency: invoice.currency || "ZAR",
        }
      } else {
        acc[email].total_outstanding += isUnpaid ? invoiceAmount : 0
        acc[email].total_paid += isPaid ? invoiceAmount : 0
        acc[email].invoice_count += 1
        acc[email].unpaid_count += isUnpaid ? 1 : 0
        acc[email].most_overdue_days = Math.max(acc[email].most_overdue_days, overdueValue)
      }

      return acc
    }, {})

    return Object.values(summaries)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unexpected error occurred while loading customer summaries.")
  }
}