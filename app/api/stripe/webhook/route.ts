import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase/server"
import { markInvoicePaidAndCreateReceipt } from "@/lib/receipt-helpers"


export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  let event: Stripe.Event

  try {
    const body = await req.text()
    const signature = req.headers.get("stripe-signature")
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    event = Stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const invoiceId = session.metadata?.invoice_id
    if (!invoiceId) {
      console.error("Webhook: missing invoice_id in metadata")
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    const amount = session.amount_total
    const currency = session.currency
    const metadataAmount = session.metadata?.amount
    const metadataCurrency = session.metadata?.currency

    const supabase = await createClient()

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", Number(invoiceId))
      .single()

    if (invoiceError || !invoice) {
      console.error("Webhook: invoice not found:", invoiceId)
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    if (invoice.invoices_status === "paid") {
      // Idempotent: already paid, success
      return NextResponse.json({ received: true })
    }

    // Verify amount (Stripe uses cents; metadata amount is in units)
    const expectedCents = Math.round(Number(metadataAmount || invoice.total_amount) * 100)
    if (amount !== expectedCents) {
      console.error("Webhook: amount mismatch", { amount, expectedCents, invoiceId })
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 })
    }

    // Verify currency
    const expectedCurrency = (metadataCurrency || invoice.currency || "ZAR").toLowerCase()
    const stripeCurrency = (currency || "").toLowerCase()
    if (stripeCurrency !== expectedCurrency && stripeCurrency !== "zar") {
      console.error("Webhook: currency mismatch", { stripeCurrency, expectedCurrency, invoiceId })
      return NextResponse.json({ error: "Currency mismatch" }, { status: 400 })
    }

    try {
      await markInvoicePaidAndCreateReceipt(supabase, Number(invoiceId), invoice.vendor_id, invoice, "stripe")
    } catch (err) {
      console.error("Webhook: failed to mark paid:", err)
      return NextResponse.json({ error: "Failed to process" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
