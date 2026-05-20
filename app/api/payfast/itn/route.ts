import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { decrypt } from "@/lib/encryption"
import { markInvoicePaidAndCreateReceipt } from "@/lib/receipt-helpers"
import { sendPaymentConfirmedEmail } from "@/app/actions/email"

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const params = new URLSearchParams(rawBody)

  // Extract signature before building data object
  const signature = params.get("signature")
  
  if (!signature) {
    return NextResponse.json({ error: "Missing PayFast signature" }, { status: 400 })
  }

  // Build data object from params, preserving order
  const data: Record<string, string> = {}
  params.forEach((value, key) => {
    if (key !== "signature") {
      data[key] = value
    }
  })

  const mPaymentId = data.m_payment_id
  const pfPaymentId = data.pf_payment_id

  if (!mPaymentId || !pfPaymentId) {
    return NextResponse.json({ error: "Missing PayFast notification identifiers" }, { status: 400 })
  }

  const supabase = await createClient()

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, vendor_id, client_id, invoice_number, total_amount, customer_name, customer_email, customer_phone, items, subtotal, tax_amount, currency")
    .eq("id", Number(mPaymentId))
    .single()

  if (invoiceError || !invoice) {
    console.error("PayFast ITN: invoice not found", invoiceError)
    return NextResponse.json({ error: "Invoice not found" }, { status: 400 })
  }

  const { data: vendor, error: vendorError } = await supabase
    .from("vendors")
    .select("payfast_passphrase_enc")
    .eq("vendor_id", invoice.vendor_id)
    .single()

  if (vendorError || !vendor?.payfast_passphrase_enc) {
    console.error("PayFast ITN: vendor credentials not found", vendorError)
    return NextResponse.json({ error: "Vendor credentials not found" }, { status: 400 })
  }

  let passphrase: string
  try {
    passphrase = decrypt(vendor.payfast_passphrase_enc)
  } catch (err) {
    console.error("PayFast ITN: failed to decrypt passphrase", err)
    return NextResponse.json({ error: "Invalid vendor passphrase" }, { status: 400 })
  }

  // Rebuild signature string from params in order, with proper encoding
  const paramString = Object.entries(data)
    .map(([key, val]) => `${key}=${encodeURIComponent(val.trim()).replace(/%20/g, "+")}`)
    .join("&")

  const signatureString = passphrase.trim()
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
    : paramString

  const expectedSignature = crypto.createHash("md5").update(signatureString).digest("hex")

  if (expectedSignature !== signature) {
    console.error("PayFast ITN: signature mismatch", { expectedSignature, signature })
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (data.payment_status !== "COMPLETE") {
    return NextResponse.json({ received: true })
  }

  const { data: existingPayments, error: existingError } = await supabase
    .from("payments")
    .select("id")
    .eq("payfast_payment_id", pfPaymentId)
    .limit(1)

  if (existingError) {
    console.error("PayFast ITN: failed to check existing payments", existingError)
    return NextResponse.json({ error: "Payment check failed" }, { status: 500 })
  }

  if (existingPayments && existingPayments.length > 0) {
    return NextResponse.json({ received: true })
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update({ invoices_status: "paid", paid_at: new Date().toISOString() })
    .eq("id", Number(mPaymentId))

  if (updateError) {
    console.error("PayFast ITN: failed to mark invoice paid", updateError)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    invoice_id: Number(mPaymentId),
    vendor_id: invoice.vendor_id,
    amount: parseFloat(data.amount_gross),
    currency: invoice.currency,
    payment_status: "completed",
    payment_method: "payfast",
    processor: "payfast",
    processor_payment_id: data.pf_payment_id,
    payfast_payment_id: data.pf_payment_id,
  })

  if (paymentError) {
    console.error("PayFast ITN: failed to insert payment", paymentError)
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
  }

  try {
    await markInvoicePaidAndCreateReceipt(supabase, Number(mPaymentId), invoice.vendor_id, {
      ...invoice,
      client_id: invoice.client_id ?? null,
    }, "payfast")
  } catch (err) {
    console.error("PayFast ITN: failed to generate receipt", err)
    return NextResponse.json({ error: "Failed to generate receipt" }, { status: 500 })
  }

  try {
    await sendPaymentConfirmedEmail(String(mPaymentId))
  } catch (err) {
    console.error("PayFast ITN: failed to send payment confirmation email", err)
  }

  return NextResponse.json({ received: true })
}
