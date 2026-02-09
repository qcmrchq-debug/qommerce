import { getClientInvoices, getClientReceipts, getClientUnpaidInvoices } from "@/app/actions/clients"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { FileText, Receipt, DollarSign } from "lucide-react"

export default async function ClientDashboardPage() {
  const [invoices, receipts, unpaid] = await Promise.all([
    getClientInvoices(),
    getClientReceipts(),
    getClientUnpaidInvoices(),
  ])

  const totalPaid = receipts.reduce((sum: number, r: any) => sum + (r.amount_paid || 0), 0)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Your Account</h2>
        <p className="text-muted-foreground">View your invoices, receipts, and payment history</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <div className="rounded-lg p-2 bg-blue-50 dark:bg-blue-950/30">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">All invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
            <div className="rounded-lg p-2 bg-yellow-50 dark:bg-yellow-950/30">
              <FileText className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaid?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Pending payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <div className="rounded-lg p-2 bg-green-50 dark:bg-green-950/30">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground">Total amount paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipts</CardTitle>
            <div className="rounded-lg p-2 bg-purple-50 dark:bg-purple-950/30">
              <Receipt className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receipts?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Payment receipts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Your latest invoice activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <Empty className="py-8">
                  <EmptyMedia variant="icon">
                    <FileText className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>No invoices yet</EmptyTitle>
                    <EmptyDescription>Invoices issued to you will appear here.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                invoices.slice(0, 5).map((inv: any) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{inv.invoice_number ?? `#${inv.id}`}</p>
                      <p className="text-sm text-muted-foreground">{inv.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(inv.total_amount)}</p>
                      <Link href={`/client/invoices/${inv.id}`} className="text-xs text-primary hover:underline">
                        View
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Receipts</CardTitle>
            <CardDescription>Your latest payment receipts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receipts.length === 0 ? (
                <Empty className="py-8">
                  <EmptyMedia variant="icon">
                    <Receipt className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>No receipts yet</EmptyTitle>
                    <EmptyDescription>Payment receipts will appear here after you pay invoices.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                receipts.slice(0, 5).map((r: any) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{r.receipt_number ?? `#${r.id}`}</p>
                      <p className="text-sm text-muted-foreground">{r.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(r.amount_paid)}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(r.payment_date || r.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
