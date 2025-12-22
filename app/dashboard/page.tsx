"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, QrCode, Receipt, DollarSign, Users } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Invoices",
      value: "24",
      change: "+12% from last month",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Total Revenue",
      value: "$12,450",
      change: "+18% from last month",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "QR Codes Generated",
      value: "18",
      change: "+8% from last month",
      icon: QrCode,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Active Customers",
      value: "12",
      change: "+4 new this month",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ]

  const recentInvoices = [
    { id: "INV-001", customer: "Acme Corp", amount: "$1,250", status: "Paid", date: "2025-01-15" },
    { id: "INV-002", customer: "TechStart Inc", amount: "$2,800", status: "Pending", date: "2025-01-14" },
    { id: "INV-003", customer: "Global Solutions", amount: "$950", status: "Paid", date: "2025-01-13" },
    { id: "INV-004", customer: "Digital Agency", amount: "$3,200", status: "Overdue", date: "2025-01-10" },
    { id: "INV-005", customer: "Startup Hub", amount: "$1,500", status: "Paid", date: "2025-01-09" },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Your latest invoice activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">{invoice.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{invoice.amount}</p>
                    <p
                      className={`text-xs ${
                        invoice.status === "Paid"
                          ? "text-green-600"
                          : invoice.status === "Pending"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {invoice.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Create New Invoice</p>
                <p className="text-sm text-muted-foreground">Generate a new invoice for a customer</p>
              </div>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Generate QR Code</p>
                <p className="text-sm text-muted-foreground">Create payment QR code</p>
              </div>
            </button>

            <button className="flex w-full items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">View Receipts</p>
                <p className="text-sm text-muted-foreground">Access auto-generated receipts</p>
              </div>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
