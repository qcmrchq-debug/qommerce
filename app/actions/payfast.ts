"use server"

import { createClient } from "@/lib/supabase/server"
import { encrypt, decrypt } from "@/lib/encryption"
import { buildPayFastData, PAYFAST_URL } from "@/lib/payfast"
import type { Invoice } from "@/lib/types"

export async function savePayFastCredentials(
  vendorId: number,
  merchantId: string,
  merchantKey: string,
  passphrase: string
) {
  const supabase = await createClient()

  const encryptedPassphrase = encrypt(passphrase)

  const { error } = await supabase
    .from("vendors")
    .update({
      payfast_merchant_id: merchantId,
      payfast_merchant_key: merchantKey,
      payfast_passphrase_enc: encryptedPassphrase,
      payfast_connected: true,
    })
    .eq("vendor_id", vendorId)

  if (error) {
    console.error("Failed to save PayFast credentials:", error)
    throw new Error("Unable to save PayFast credentials. Please try again.")
  }

  return { success: true }
}

export async function buildPayFastPaymentData(invoiceId: number) {
  const supabase = await createClient()

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, invoice_number, total_amount, vendor_id")
    .eq("id", invoiceId)
    .single()

  if (invoiceError || !invoice) {
    console.error("Failed to fetch invoice for PayFast payment:", invoiceError)
    throw new Error("Invoice not found")
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("payfast_merchant_id, payfast_merchant_key, payfast_passphrase_enc, payfast_connected")
    .eq("vendor_id", invoice.vendor_id)
    .single()

  if (vendorError || !vendor) {
    console.error("Failed to fetch vendor for PayFast payment:", vendorError)
    throw new Error("Unable to resolve vendor credentials")
  }

  if (!vendor.payfast_connected) {
    throw new Error("Vendor has not connected PayFast")
  }

  if (!vendor.payfast_merchant_id || !vendor.payfast_merchant_key || !vendor.payfast_passphrase_enc) {
    throw new Error("Vendor PayFast credentials are incomplete")
  }

  const passphrase = decrypt(vendor.payfast_passphrase_enc)

  const formData = buildPayFastData(
    invoice as Pick<Invoice, "id" | "invoice_number" | "total_amount">,
    {
      payfast_merchant_id: vendor.payfast_merchant_id,
      payfast_merchant_key: vendor.payfast_merchant_key,
    },
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    passphrase
  )

  return {
    payfastUrl: PAYFAST_URL,
    formData,
  }
}
