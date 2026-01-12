import { getClientInvoices, getClientReceipts, getClientUnpaidInvoices } from "@/app/actions/clients"
import Link from "next/link"

export default async function ClientDashboardPage() {
  const [invoices, receipts, unpaid] = await Promise.all([
    getClientInvoices(),
    getClientReceipts(),
    getClientUnpaidInvoices(),
  ])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Your Account</h1>
        <p className="text-muted-foreground">View your invoices, receipts, and payment history</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 bg-card rounded-md shadow-sm">
          <div className="text-muted-foreground">Total Invoices</div>
          <div className="text-2xl font-semibold">{invoices?.length ?? 0}</div>
        </div>
        <div className="p-4 bg-card rounded-md shadow-sm">
          <div className="text-muted-foreground">Unpaid Invoices</div>
          <div className="text-2xl font-semibold">{unpaid?.length ?? 0}</div>
        </div>
        <div className="p-4 bg-card rounded-md shadow-sm">
          <div className="text-muted-foreground">Receipts</div>
          <div className="text-2xl font-semibold">{receipts?.length ?? 0}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-card rounded-md shadow-sm">
          <h2 className="font-semibold">Recent Invoices</h2>
          <ul className="mt-2">
            {(invoices || []).slice(0, 5).map((inv: any) => (
              <li key={inv.id} className="py-2 border-b border-border">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{inv.invoice_number ?? `#${inv.id}`}</div>
                    <div className="text-sm text-muted-foreground">{inv.customer_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{inv.total_amount}</div>
                    <div className="text-sm text-muted-foreground">{inv.invoices_status}</div>
                    <Link className="mt-2 text-primary underline" href={`/client/invoices/${inv.id}`}>View</Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 bg-card rounded-md shadow-sm">
          <h2 className="font-semibold">Recent Receipts</h2>
          <ul className="mt-2">
            {(receipts || []).slice(0, 5).map((r: any) => (
              <li key={r.id} className="py-2 border-b border-border">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{r.receipt_number ?? `#${r.id}`}</div>
                    <div className="text-sm text-muted-foreground">{r.customer_name}</div>
                  </div>
                  <div className="font-semibold">{r.amount_paid}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/client/invoices" className="underline text-primary">View all invoices</Link>
        <Link href="/client/receipts" className="underline text-primary">View all receipts</Link>
      </div>
    </div>
  )
}
