"use client"

import React from "react"

export default function InvoiceDetails({ invoice }: { invoice: any }) {
  const isPaid = invoice.invoices_status === "paid"

  return (
    <div className="max-w-3xl mx-auto p-6 bg-card rounded-lg shadow-sm text-foreground">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Invoice {invoice.invoice_number ?? invoice.id}</h2>
          <p className="text-sm text-muted-foreground">Created: {new Date(invoice.created_at).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-card text-foreground border border-border">
            {isPaid ? 'Paid' : 'Unpaid'}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Customer</div>
          <div className="mt-1 font-medium">{invoice.customer_name}</div>
          {invoice.customer_email && <div className="text-sm text-muted-foreground">{invoice.customer_email}</div>}
        </div>

        <div className="text-right">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="mt-1 text-2xl font-semibold text-foreground">{invoice.total_amount}</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm text-muted-foreground">Items</div>
        <ul className="mt-2 list-disc list-inside text-sm">
          {(invoice.items || []).map((item: any, idx: number) => (
            <li key={idx} className="py-1">
              <div className="font-medium text-foreground">{item.name || item.description || 'Item'}</div>
              <div className="text-sm text-muted-foreground">Qty: {item.quantity ?? 1} • Amount: {item.amount ?? ''}</div>
            </li>
          ))}
        </ul>
      </div>

      {invoice.receipt_generated && (
        <div className="mt-6 text-sm">
          Receipt generated — see <a className="underline text-foreground font-medium" href="/dashboard/receipts">Receipts</a>
        </div>
      )}
    </div>
  )
}
