"use server"

import { createClient } from "@/lib/supabase/server"
import { getClientInvoiceById } from "@/app/actions/clients"
import { markInvoicePaidAndCreateReceipt } from "@/lib/receipt-helpers"
import { getVendorId } from "@/app/actions/vendors"
import Stripe from "stripe"

function getBaseUrl(): string {
  if (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  }
  if (typeof process.env.VERCEL_URL === "string" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

export type PaymentMethod = "stripe" | "manual"

export type InitiatePaymentResult =
  | { success: true; redirectUrl?: string; message?: string }
  | { success: false; error: string }

/**
 * Client initiates payment. Verifies ownership, never trusts client amount.
 * Returns redirect URL for Stripe, or success for manual (shows instructions).
 */
export async function initiatePayment(
  invoiceId: number,
  method: PaymentMethod
): Promise<InitiatePaymentResult> {
  const invoice = await getClientInvoiceById(invoiceId)
  if (!invoice) {
    return { success: false, error: "Invoice not found or you don't have access to it." }
  }

  if (invoice.invoices_status === "paid") {
    return { success: false, error: "This invoice has already been paid." }
  }

  if (invoice.invoices_status === "payment_pending") {
    return { success: false, error: "Payment is already pending. Please wait for confirmation." }
  }

  // Amount from invoice only - never from client
  const amount = invoice.total_amount
  const currency = invoice.currency || "ZAR"

  if (method === "stripe") {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      return { success: false, error: "Stripe is not configured. Please use manual payment." }
    }

    const stripe = new Stripe(stripeSecretKey)
    const baseUrl = getBaseUrl()

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase() === "zar" ? "zar" : "usd",
              product_data: {
                name: `Invoice ${invoice.invoice_number}`,
                description: `Payment for invoice ${invoice.invoice_number}`,
              },
              unit_amount: Math.round(amount * 100), // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/client/invoices/${invoiceId}?paid=1`,
        cancel_url: `${baseUrl}/client/pay/${invoiceId}`,
        metadata: {
          invoice_id: String(invoiceId),
          invoice_number: invoice.invoice_number,
          amount: String(amount),
          currency,
        },
      })

      return {
        success: true,
        redirectUrl: session.url || undefined,
      }
    } catch (err) {
      console.error("Stripe checkout error:", err)
      return {
        success: false,
        error: err instanceof Error ? err.message : "Failed to create payment session.",
      }
    }
  }

  // Manual payment: set payment_pending
  const supabase = await createClient()
  const { error } = await supabase
    .from("invoices")
    .update({ invoices_status: "payment_pending" })
    .eq("id", invoiceId)
    .eq("vendor_id", invoice.vendor_id)

  if (error) {
    console.error("Error setting payment_pending:", error)
    return { success: false, error: "Failed to initiate payment. Please try again." }
  }

  return {
    success: true,
    message: "Payment initiated. Follow the instructions below.",
  }
}

/**
 * Vendor confirms manual payment. Only for payment_pending invoices.
 */
export async function confirmManualPayment(
  invoiceId: number
): Promise<{ success: boolean; receipt?: any; error?: string }> {
  const supabase = await createClient()
  const vendorId = await getVendorId()

  const { data: invoice, error: fetchError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("vendor_id", vendorId)
    .single()

  if (fetchError || !invoice) {
    return { success: false, error: "Invoice not found." }
  }

  if (invoice.invoices_status !== "payment_pending") {
    return { success: false, error: "Only payment_pending invoices can be confirmed." }
  }

  try {
    const { receipt } = await markInvoicePaidAndCreateReceipt(supabase, invoiceId, vendorId, invoice, "bank_transfer")
    return { success: true, receipt }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Failed to confirm payment." }
  }
}
