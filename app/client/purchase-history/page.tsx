import { getClientPaidInvoices, getClientReceipts } from "@/app/actions/clients"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export default async function PurchaseHistoryPage() {
  const [invoices, receipts] = await Promise.all([getClientPaidInvoices(), getClientReceipts()])

  const receiptInvoiceIds = new Set((receipts || []).map((r: any) => r.invoice_id))

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Purchase History</h1>
        <p className="text-muted-foreground">All paid invoices issued to you</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>View Invoice</TableHead>
              <TableHead>View Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(invoices || []).map((inv: any) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.invoice_number ?? `#${inv.id}`}</TableCell>
                <TableCell>{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                <TableCell>{inv.total_amount}</TableCell>
                <TableCell>
                  <Link href={`/client/invoices/${inv.id}`} className="underline text-primary">View</Link>
                </TableCell>
                <TableCell>
                  {receiptInvoiceIds.has(inv.id) ? (
                    <Link href="/client/receipts" className="underline text-primary">View Receipt</Link>
                  ) : (
                    <span className="text-muted-foreground">No receipt</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
