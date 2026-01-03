"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, QrCode, Receipt, DollarSign, Users } from "lucide-react"
import Link from "next/link"

export default function DashboardClient({ stats }: { stats: any }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount)
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <div className={`rounded-lg p-2 bg-blue-50 dark:bg-blue-950/30`}>
              <FileText className={`h-4 w-4 text-blue-600`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">Total invoices created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className={`rounded-lg p-2 bg-green-50 dark:bg-green-950/30`}>
              <DollarSign className={`h-4 w-4 text-green-600`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Total revenue earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Codes Generated</CardTitle>
            <div className={`rounded-lg p-2 bg-purple-50 dark:bg-purple-950/30`}>
              <QrCode className={`h-4 w-4 text-purple-600`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.qrCodesGenerated}</div>
            <p className="text-xs text-muted-foreground">QR codes created</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <div className={`rounded-lg p-2 bg-orange-50 dark:bg-orange-950/30`}>
              <Users className={`h-4 w-4 text-orange-600`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered customers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/invoices/create">
              <button className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Create New Invoice</p>
                  <p className="text-sm text-muted-foreground">Generate a new invoice for a customer</p>
                </div>
              </button>
            </Link>

            <Link href="/dashboard/qr-codes">
              <button className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Generate QR Code</p>
                  <p className="text-sm text-muted-foreground">Create payment QR code</p>
                </div>
              </button>
            </Link>

            <Link href="/dashboard/customers">
              <button className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">View Customers</p>
                  <p className="text-sm text-muted-foreground">Manage your customer list</p>
                </div>
              </button>
            </Link>

            <Link href="/dashboard/receipts">
              <button className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">View Receipts</p>
                  <p className="text-sm text-muted-foreground">Access auto-generated receipts</p>
                </div>
              </button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Your latest invoice activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentInvoices.length === 0 ? (
                <p>No invoices yet. <Link href="/dashboard/invoices/create" className="text-primary">Create your first invoice</Link></p>
              ) : (
                stats.recentInvoices.map((invoice: any) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">{invoice.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(invoice.total_amount)}</p>
                      <p
                        className={`text-xs ${
                          invoice.invoices_status === "paid"
                            ? "text-green-600"
                            : invoice.invoices_status === "pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {invoice.invoices_status}
                      </p>
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