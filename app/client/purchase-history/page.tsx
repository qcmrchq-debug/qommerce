import { getClientPaidInvoices, getClientReceipts } from "@/app/actions/clients"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { formatCurrency, formatDate } from "@/lib/utils"
import { FileText } from "lucide-react"
import Link from "next/link"

export default async function PurchaseHistoryPage() {
  const [invoices, receipts] = await Promise.all([getClientPaidInvoices(), getClientReceipts()])

  const receiptInvoiceIds = new Set((receipts || []).map((r) => r.invoice_id))

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paid Invoices</h1>
        <p className="text-muted-foreground">Invoices you've paid — view invoice details or download receipts</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Paid Invoices</CardTitle>
          <CardDescription>Completed purchases with links to view invoice and receipt</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <Empty>
              <EmptyMedia>
                <FileText className="h-12 w-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyHeader>
              <EmptyTitle>No paid invoices yet</EmptyTitle>
              <EmptyDescription>
                Paid invoices will appear here. Pay an invoice from My Invoices to get started.
              </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
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
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        {inv.invoice_number ?? `#${inv.id}`}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(inv.created_at)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(inv.total_amount)}</TableCell>
                    <TableCell>
                      <Link href={`/client/invoices/${inv.id}`} className="text-primary hover:underline">
                        View
                      </Link>
                    </TableCell>
                    <TableCell>
                      {receiptInvoiceIds.has(inv.id) ? (
                        <Link href="/client/receipts" className="text-primary hover:underline">
                          View Receipt
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">No receipt</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
