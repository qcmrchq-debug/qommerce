/**
 * Internal receipt generation logic - reused by webhook, vendor confirmation, and mark-as-paid.
 * Ensures exactly one receipt per invoice and idempotency.
 * DO NOT expose to client.
 */
import type { SupabaseClient } from "@supabase/supabase-js"

export async function markInvoicePaidAndCreateReceipt(
  supabase: SupabaseClient,
  invoiceId: number,
  vendorId: number,
  invoice: {
    client_id: number | null
    customer_name: string
    customer_email: string
    customer_phone: string | null
    items: any[]
    subtotal: number
    tax_amount: number
    total_amount: number
    currency: string
  },
  paymentMethod: string
): Promise<{ receipt: any }> {
  // Update invoice status
  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      invoices_status: "paid",
      paid_at: new Date().toISOString(),
      receipt_generated: true,
    })
    .eq("id", invoiceId)
    .eq("vendor_id", vendorId)

  if (updateError) {
    throw new Error("Failed to mark invoice as paid.")
  }

  // Ensure only one receipt per invoice: return existing if present
  const { data: existingReceipts } = await supabase
    .from("receipts")
    .select("*")
    .eq("invoice_id", invoiceId)
    .limit(1)

  if (existingReceipts && existingReceipts.length > 0) {
    return { receipt: existingReceipts[0] }
  }

  // Create receipt
  const { data: receipt, error: receiptError } = await supabase
    .from("receipts")
    .insert({
      vendor_id: vendorId,
      invoice_id: invoiceId,
      client_id: invoice.client_id,
      customer_name: invoice.customer_name,
      customer_email: invoice.customer_email,
      customer_phone: invoice.customer_phone,
      items: invoice.items,
      subtotal: invoice.subtotal,
      tax_amount: invoice.tax_amount,
      total_amount: invoice.total_amount,
      amount_paid: invoice.total_amount,
      payment_method: paymentMethod,
      currency: invoice.currency || "ZAR",
      payment_date: new Date().toISOString(),
    })
    .select()
    .single()

  if (receiptError) {
    throw new Error("Failed to generate receipt.")
  }

  return { receipt }
}
