"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils"
import { getCustomerSummaries, CustomerSummary } from "@/app/actions/invoices"

type SortKey = "amount" | "days"

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [customers, setCustomers] = useState<CustomerSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>("amount")

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getCustomerSummaries()
        setCustomers(data)
      } catch (error) {
        toast.error("Failed to load outstanding customer balances")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredCustomers = useMemo(
    () =>
      customers
        .filter((customer) =>
          [customer.customer_name, customer.customer_email]
            .join(" ")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
        )
        .sort((a, b) =>
          sortKey === "amount"
            ? b.total_outstanding - a.total_outstanding
            : b.most_overdue_days - a.most_overdue_days,
        ),
    [customers, searchQuery, sortKey],
  )

  const totalOutstanding = customers.reduce((sum, customer) => sum + customer.total_outstanding, 0)
  const totalPaid = customers.reduce((sum, customer) => sum + customer.total_paid, 0)

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">Customer balances summary</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={sortKey === "amount" ? "default" : "outline"} onClick={() => setSortKey("amount")}>Amount Outstanding ↓</Button>
          <Button variant={sortKey === "days" ? "default" : "outline"} onClick={() => setSortKey("days")}>Days Overdue ↓</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">Customer Balances</CardTitle>
              <CardDescription>{customers.length} customer{customers.length === 1 ? "" : "s"} with invoices</CardDescription>
            </div>
            <div className="relative w-full max-w-sm min-w-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 w-full min-w-0"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-muted/70 bg-muted p-4">
              <p className="text-sm text-muted-foreground">Customers</p>
              <p className="text-2xl font-semibold">{customers.length}</p>
            </div>
            <div className="rounded-2xl border border-muted/70 bg-muted p-4">
              <p className="text-sm text-muted-foreground">Total Outstanding</p>
              <p className="text-2xl font-semibold">{formatCurrency(totalOutstanding)}</p>
            </div>
            <div className="rounded-2xl border border-muted/70 bg-muted p-4">
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(totalPaid)}</p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-muted/70 bg-muted p-8 text-center text-sm text-muted-foreground">
              Loading outstanding balances...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-muted/70 bg-muted p-12 text-center">
              <p className="text-lg font-semibold">No outstanding balances</p>
              <p className="text-sm text-muted-foreground">All customers are up to date or there are no unpaid invoices.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCustomers.map((customer) => (
                <div key={customer.customer_email} className="rounded-3xl border border-muted/70 bg-background p-4 sm:p-6 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold">{customer.customer_name}</p>
                      <p className="break-all text-sm text-muted-foreground min-w-0">{customer.customer_email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <Badge variant="outline">{customer.invoice_count} invoice{customer.invoice_count === 1 ? "" : "s"}</Badge>
                      <Badge variant="secondary">{customer.currency || "ZAR"}</Badge>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Total outstanding</p>
                      <p className={`text-2xl font-semibold ${customer.total_outstanding > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                        {formatCurrency(customer.total_outstanding)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total paid</p>
                      <p className="text-2xl font-semibold text-emerald-600">
                        {formatCurrency(customer.total_paid)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-muted-foreground">{customer.unpaid_count} unpaid / {customer.invoice_count} total invoices</p>
                    {customer.total_outstanding === 0 ? (
                      <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700">Settled ✓</Badge>
                    ) : customer.most_overdue_days > 0 ? (
                      <p className="text-destructive text-lg font-semibold">{customer.most_overdue_days} days overdue</p>
                    ) : (
                      <p className="text-muted-foreground text-sm">No overdue balance</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
