"use client"

import { useState, useEffect } from "react"
import { getClientReceipts } from "@/app/actions/clients"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { generateReceiptPDF } from "@/lib/pdf"
import { Receipt, MoreVertical, Download } from "lucide-react"
import { toast } from "sonner"
import type { Receipt as ReceiptType } from "@/lib/types"

export default function ClientReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReceipts() {
      try {
        const data = await getClientReceipts()
        setReceipts(data)
      } catch (error) {
        toast.error("Failed to load receipts")
      } finally {
        setLoading(false)
      }
    }
    fetchReceipts()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Receipts</h2>
        <p className="text-muted-foreground">Payment confirmation documents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Receipts</CardTitle>
          <CardDescription>Payment confirmations for invoices you've paid</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading receipts...
                  </TableCell>
                </TableRow>
              ) : receipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="p-0">
                    <Empty className="py-12">
                      <EmptyMedia variant="icon">
                        <Receipt className="h-6 w-6" />
                      </EmptyMedia>
                      <EmptyHeader>
                        <EmptyTitle>No receipts yet</EmptyTitle>
                        <EmptyDescription>
                          Payment receipts will appear here after you pay an invoice.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </TableCell>
                </TableRow>
              ) : (
                receipts.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Receipt className="h-4 w-4" />
                        </div>
                        {r.receipt_number ?? `#${r.id}`}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(r.payment_date || r.created_at)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(r.amount_paid)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {r.payment_method?.replace('_', ' ') || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => generateReceiptPDF(r)}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
