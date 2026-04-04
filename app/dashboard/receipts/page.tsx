"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Search, MoreVertical, Download, Receipt, FileText } from "lucide-react"
import { getReceipts } from "@/app/actions/invoices"
import { generateReceiptPDF } from "@/lib/pdf"
import { toast } from "sonner"

interface Receipt {
  id: number
  receipt_number: string
  customer_name: string
  customer_email: string
  total_amount: number
  amount_paid: number
  payment_method: string
  payment_date: string
  created_at: string
  invoice_id: number
}

export default function ReceiptsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchReceipts() {
      try {
        const data = await getReceipts()
        setReceipts(data)
      } catch (error) {
        toast.error("Failed to load receipts")
      } finally {
        setLoading(false)
      }
    }
    fetchReceipts()
  }, [])

  const filteredReceipts = receipts.filter(
    (receipt) =>
      receipt.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.customer_email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Receipts</h2>
          <p className="text-muted-foreground">Auto-generated receipts for all transactions</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Receipts</CardDescription>
            <CardTitle className="text-3xl">{receipts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Amount</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {formatCurrency(receipts.reduce((sum, r) => sum + r.amount_paid, 0))}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {receipts.filter((r) => {
                const receiptDate = new Date(r.created_at)
                const now = new Date()
                return receiptDate.getMonth() === now.getMonth() &&
                       receiptDate.getFullYear() === now.getFullYear()
              }).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Amount</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {receipts.length > 0
                ? formatCurrency(receipts.reduce((sum, r) => sum + r.amount_paid, 0) / receipts.length)
                : formatCurrency(0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div>
              <CardTitle>All Receipts</CardTitle>
              <CardDescription>A list of all your receipts and their details</CardDescription>
            </div>
            <div className="relative w-full max-w-sm min-w-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search receipts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full min-w-0"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Loading receipts...
                  </TableCell>
                </TableRow>
              ) : filteredReceipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No receipts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Receipt className="h-4 w-4" />
                        </div>
                        {receipt.receipt_number}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{receipt.customer_name}</div>
                        <div className="text-sm text-muted-foreground">{receipt.customer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(receipt.amount_paid)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {receipt.payment_method?.replace('_', ' ') || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(receipt.payment_date)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-full sm:w-auto">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => generateReceiptPDF(receipt)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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
