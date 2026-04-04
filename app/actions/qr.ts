"use server"

import QRCode from "qrcode"
import { createClient } from "@/lib/supabase/server"
import { getVendorId } from "@/app/actions/vendors"

function getBaseUrl(): string {
  if (typeof process.env.NEXT_PUBLIC_APP_URL === "string" && process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  }
  if (typeof process.env.VERCEL_URL === "string" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return "http://localhost:3000"
}

/**
 * Generate QR code for an invoice if not already present.
 * QR encodes the public client pay URL: /client/pay/[invoiceId]
 * Persists data URL in invoices.qr_code_url.
 */
export async function getOrCreateInvoiceQRCode(invoiceId: number): Promise<string | null> {
  const supabase = await createClient()
  const vendorId = await getVendorId()

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, qr_code_url, payment_url, vendor_id")
    .eq("id", invoiceId)
    .eq("vendor_id", vendorId)
    .single()

  if (error || !invoice) return null

  const baseUrl = getBaseUrl()
  const payUrl = `${baseUrl}/client/pay/${invoiceId}`

  if (invoice.qr_code_url && invoice.payment_url === payUrl) {
    return invoice.qr_code_url
  }

  if (invoice.qr_code_url && invoice.payment_url !== payUrl) {
    const { error: updateError } = await supabase
      .from("invoices")
      .update({ payment_url: payUrl })
      .eq("id", invoiceId)
      .eq("vendor_id", vendorId)

    if (updateError) {
      console.error("Error persisting payment URL:", updateError)
    }

    return invoice.qr_code_url
  }

  try {
    const dataUrl = await QRCode.toDataURL(payUrl, {
      width: 256,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    })

    const { error: updateError } = await supabase
      .from("invoices")
      .update({ qr_code_url: dataUrl, payment_url: payUrl })
      .eq("id", invoiceId)
      .eq("vendor_id", vendorId)

    if (updateError) {
      console.error("Error persisting QR code and payment URL:", updateError)
      return dataUrl
    }
    return dataUrl
  } catch (err) {
    console.error("Error generating QR code:", err)
    return null
  }
}
