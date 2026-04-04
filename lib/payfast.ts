import crypto from "crypto"
import type { Invoice } from "./types"

export const PAYFAST_URL =
  process.env.NODE_ENV !== "production"
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process"

function buildPayFastSignature(data: Record<string, string>, passphrase: string): string {
  const paramString = Object.entries(data)
    .map(([key, val]) => `${key}=${encodeURIComponent(val.trim()).replace(/%20/g, "+")}`)
    .join("&")

  const signatureString = passphrase.trim()
    ? `${paramString}&passphrase=${encodeURIComponent(passphrase.trim()).replace(/%20/g, "+")}`
    : paramString

  return crypto.createHash("md5").update(signatureString).digest("hex")
}

export function buildPayFastData(
  invoice: Pick<Invoice, "id" | "invoice_number" | "total_amount">,
  vendor: { payfast_merchant_id: string; payfast_merchant_key: string },
  appUrl: string,
  passphrase: string
) {
  const data = {
    merchant_id: vendor.payfast_merchant_id,
    merchant_key: vendor.payfast_merchant_key,
    return_url: `${appUrl.replace(/\/$/, "")}/client/payment/success?invoice=${invoice.id}`,
    cancel_url: `${appUrl.replace(/\/$/, "")}/client/payment/cancel?invoice=${invoice.id}`,
    notify_url: `${appUrl.replace(/\/$/, "")}/api/payfast/itn`,
    m_payment_id: String(invoice.id),
    amount: Number(invoice.total_amount).toFixed(2),
    item_name: `Invoice ${invoice.invoice_number}`,
  }

  const signature = buildPayFastSignature(data, passphrase)
  return {
    ...data,
    signature,
  }
}
