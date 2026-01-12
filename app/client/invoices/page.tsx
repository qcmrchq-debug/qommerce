import Link from "next/link"
import { getClientInvoices } from "@/app/actions/clients"

export default async function ClientInvoicesPage() {
  const invoices = await getClientInvoices()

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-bold">Your Invoices</h1>
        <p className="text-muted-foreground">All invoices issued to you</p>
      </div>

      <div className="mt-6 bg-card rounded-md shadow-sm">
        <ul>
          {invoices.map((inv: any) => (
            <li key={inv.id} className="py-4 px-4 border-b border-border flex justify-between items-center">
              <div>
                <div className="font-medium">{inv.invoice_number ?? `#${inv.id}`}</div>
                <div className="text-sm text-muted-foreground">{inv.customer_name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{inv.total_amount}</div>
                <div className="text-sm text-muted-foreground">{inv.invoices_status}</div>
                <div className="mt-2 flex gap-2 justify-end">
                  <Link href={`/client/invoices/${inv.id}`} className="underline text-primary">View</Link>
                  <button className="px-3 py-1 rounded-md bg-primary/10 text-primary" disabled>Pay</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
