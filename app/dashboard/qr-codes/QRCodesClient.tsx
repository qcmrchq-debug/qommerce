"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { getOrCreateInvoiceQRCode } from "@/app/actions/qr"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { QrCode, Download, FileText } from "lucide-react"

interface Invoice {
  id: number
  invoice_number: string
  customer_name: string
  total_amount: number
  invoices_status: string
  created_at: string
  qr_code_url: string | null
}

function QRCell({ invoiceId }: { invoiceId: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    getOrCreateInvoiceQRCode(invoiceId).then(setDataUrl)
  }, [invoiceId])

  const handleDownload = () => {
    if (!dataUrl) return
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `invoice-${invoiceId}-qr.png`
    link.click()
  }

  if (!dataUrl) {
    return (
      <div className="h-20 w-20 rounded border border-dashed bg-muted/50 animate-pulse" />
    )
  }

  return (
    <div className="flex items-center gap-2">
      <img src={dataUrl} alt="QR Code" className="h-20 w-20 rounded border object-contain" />
      <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1">
        <Download className="h-4 w-4" />
        Download
      </Button>
    </div>
  )
}

export default function QRCodesClient({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending: "secondary",
      overdue: "destructive",
      draft: "outline",
    }
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">QR Codes</h2>
        <p className="text-muted-foreground">
          QR codes link to the payment page for each invoice. Generate once and download for printing.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice QR Codes</CardTitle>
          <CardDescription>
            Each QR code encodes the public payment URL. Scan to pay.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <Empty>
              <EmptyMedia variant="icon">
                <FileText className="h-6 w-6" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>No invoices yet</EmptyTitle>
                <EmptyDescription>
                  Create an invoice to generate QR codes for payment.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>QR Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <QrCode className="h-4 w-4" />
                        </div>
                        {inv.invoice_number ?? `#${inv.id}`}
                      </div>
                    </TableCell>
                    <TableCell>{inv.customer_name}</TableCell>
                    <TableCell>{formatDate(inv.created_at)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(inv.total_amount)}</TableCell>
                    <TableCell>{getStatusBadge(inv.invoices_status)}</TableCell>
                    <TableCell>
                      <QRCell invoiceId={inv.id} />
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
