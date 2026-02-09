import Link from "next/link"
import { getClientInvoices } from "@/app/actions/clients"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { FileText } from "lucide-react"

export default async function ClientInvoicesPage() {
  const invoices = await getClientInvoices()

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending: "secondary",
      payment_pending: "secondary",
      overdue: "destructive",
      draft: "outline",
    }
    const label = status === "payment_pending" ? "Payment Pending" : status

    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {label.replace("_", " ")}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Your Invoices</h2>
        <p className="text-muted-foreground">All invoices issued to you</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>A list of all your invoices and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <Empty className="py-12">
                      <EmptyMedia variant="icon">
                        <FileText className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle>No invoices yet</EmptyTitle>
                        <EmptyDescription>
                          Invoices issued to you will appear here. Check back once your vendor sends you one.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv: any) => (
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
                    <TableCell>{getStatusBadge(inv.invoices_status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/client/invoices/${inv.id}`}>View</Link>
                        </Button>
                        {inv.invoices_status !== "paid" && inv.invoices_status !== "payment_pending" && (
                          <Button size="sm" asChild>
                            <Link href={`/client/pay/${inv.id}`}>Pay</Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
