"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { formatCurrency, formatDate } from "@/lib/utils"
import { generateInvoicePDF } from "@/lib/pdf"
import { Download } from "lucide-react"
import Link from "next/link"
import type { Invoice } from "@/lib/types"

interface InvoiceDetailsProps {
  invoice: Invoice
  userType?: "vendor" | "client"
  showDownloadButton?: boolean
}

export default function InvoiceDetails({ 
  invoice, 
  userType = "vendor",
  showDownloadButton = true 
}: InvoiceDetailsProps) {
  const isPaid = invoice.invoices_status === "paid"
  const receiptsPath = userType === "vendor" ? "/dashboard/receipts" : "/client/receipts"

  const getStatusBadge = () => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending: "secondary",
      payment_pending: "secondary",
      overdue: "destructive",
      draft: "outline",
    }
    const label = invoice.invoices_status === "payment_pending" ? "Payment Pending" : invoice.invoices_status

    return (
      <Badge variant={variants[invoice.invoices_status] || "outline"} className="capitalize">
        {label.replace("_", " ")}
      </Badge>
    )
  }

  const canPay = userType === "client" && invoice.invoices_status !== "paid" && invoice.invoices_status !== "payment_pending"

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={userType === "vendor" ? "/dashboard" : "/client"}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={userType === "vendor" ? "/dashboard/invoices" : "/client/invoices"}>
                {userType === "vendor" ? "Invoices" : "My Invoices"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Invoice {invoice.invoice_number}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Invoice {invoice.invoice_number}</CardTitle>
              <CardDescription>Created: {formatDate(invoice.created_at)}</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end">
              {getStatusBadge()}
              {canPay && (
                <Button size="sm" className="gap-2 w-full sm:w-auto" asChild>
                  <Link href={`/client/pay/${invoice.id}`}>
                    Pay Invoice
                  </Link>
                </Button>
              )}
              {showDownloadButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateInvoicePDF(invoice)}
                  className="gap-2 w-full sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">From</h3>
              <div className="space-y-1">
                <p className="font-medium">{invoice.vendors?.name || "Vendor"}</p>
                {invoice.vendors?.email && (
                  <p className="text-sm text-muted-foreground">{invoice.vendors.email}</p>
                )}
                {invoice.vendors?.phone && (
                  <p className="text-sm text-muted-foreground">{invoice.vendors.phone}</p>
                )}
              </div>
            </div>

            <div className="text-right">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Bill To</h3>
              <div className="space-y-1">
                <p className="font-medium">{invoice.customer_name}</p>
                <p className="text-sm text-muted-foreground">{invoice.customer_email}</p>
                {invoice.customer_phone && (
                  <p className="text-sm text-muted-foreground">{invoice.customer_phone}</p>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-muted/50 pt-4">
            <div className="text-right">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Invoice Details</h3>
              <div className="space-y-1">
                {invoice.due_date && (
                  <p className="text-sm text-muted-foreground">
                    Due: {formatDate(invoice.due_date)}
                  </p>
                )}
                <p className="text-2xl font-semibold">{formatCurrency(invoice.total_amount)}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items && invoice.items.length > 0 ? (
                  invoice.items.map((item, idx) => {
                    const itemTotal = (item.quantity || 1) * (item.price || 0)
                    return (
                      <TableRow key={idx}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.name || item.description || "Item"}</div>
                            {item.description && item.name && (
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity || 1}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price || 0)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(itemTotal)}</TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No items
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </div>

          {invoice.receipt_generated && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Receipt generated —{" "}
                <Link href={receiptsPath} className="text-primary hover:underline font-medium">
                  View Receipt
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
