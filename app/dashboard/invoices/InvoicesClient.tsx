"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Search, MoreVertical, Download, Eye, Edit, Trash2, FileText, CheckCircle } from "lucide-react"
import { deleteInvoice, markInvoiceAsPaid, updateInvoice } from "@/app/actions/invoices"
import { confirmManualPayment } from "@/app/actions/payments"
import { generateInvoicePDF, generateReceiptPDF } from "@/lib/pdf"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Invoice {
  id: number
  invoice_number: string
  customer_name: string
  total_amount: number
  invoices_status: string
  created_at: string
  due_date: string | null
  client_id: number | null
  customer_email: string
  customer_phone: string | null
  items: any[]
  subtotal: number
  tax_amount: number
}

interface Client {
  id: number
  name: string
  email: string
  phone: string | null
  company: string | null
}

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
})

const editInvoiceSchema = z.object({
  client_id: z.number().optional(),
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: z.string().email("Invalid email"),
  customer_phone: z.string().optional(),
  due_date: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
})

type EditInvoiceForm = z.infer<typeof editInvoiceSchema>

export default function InvoicesClient({ initialInvoices, initialClients, vendorId }: { initialInvoices: Invoice[]; initialClients: Client[]; vendorId: number }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [loading, setLoading] = useState(false)
  const [clients] = useState<Client[]>(initialClients)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [selectedClientId, setSelectedClientId] = useState<string>("manual")

  const {
    register: registerEdit,
    control: controlEdit,
    handleSubmit: handleSubmitEdit,
    watch: watchEdit,
    setValue: setValueEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit },
  } = useForm<EditInvoiceForm>({
    resolver: zodResolver(editInvoiceSchema),
  })

  const { fields: fieldsEdit, append: appendEdit, remove: removeEdit } = useFieldArray({
    control: controlEdit,
    name: "items",
  })

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setSelectedClientId(invoice.client_id?.toString() || "manual")

    resetEdit({
      client_id: invoice.client_id || undefined,
      customer_name: invoice.customer_name,
      customer_email: invoice.customer_email,
      customer_phone: invoice.customer_phone || "",
      due_date: invoice.due_date || "",
      items: invoice.items || [{ name: "", description: "", quantity: 1, price: 0 }],
    })

    setEditDialogOpen(true)
  }

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId)
    if (clientId && clientId !== "manual") {
      const client = clients.find(c => c.id.toString() === clientId)
      if (client) {
        setValueEdit("client_id", client.id)
        setValueEdit("customer_name", client.name)
        setValueEdit("customer_email", client.email)
        setValueEdit("customer_phone", client.phone || "")
      }
    } else {
      setValueEdit("client_id", undefined)
    }
  }

  const onSubmitEdit = async (data: EditInvoiceForm) => {
    if (!editingInvoice) return

    const watchedItems = watchEdit("items")
    const subtotal = watchedItems?.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0) || 0
    const taxRate = 0.15
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount

    try {
      await updateInvoice(editingInvoice.id, {
        client_id: data.client_id,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        items: data.items,
        subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        due_date: data.due_date,
      })

      // Update the invoice in the local state
      setInvoices(invoices.map(inv => 
        inv.id === editingInvoice.id 
          ? { ...inv, ...data, subtotal, tax_amount: taxAmount, total_amount: total, due_date: data.due_date || null }
          : inv
      ))

      toast.success("Invoice updated successfully")
      setEditDialogOpen(false)
      setEditingInvoice(null)
    } catch (error) {
      toast.error("Failed to update invoice")
    }
  }

  const handleConfirmManualPayment = async (invoice: Invoice) => {
    if (confirm("Confirm that you have received payment for this invoice? This will generate a receipt.")) {
      try {
        const result = await confirmManualPayment(invoice.id)
        if (!result.success) {
          toast.error(result.error || "Failed to confirm payment")
          return
        }
        setInvoices(invoices.map(inv =>
          inv.id === invoice.id ? { ...inv, invoices_status: "paid" as const } : inv
        ))
        if (result.receipt) {
          generateReceiptPDF(result.receipt)
        }
        toast.success("Payment confirmed and receipt generated")
      } catch {
        toast.error("Failed to confirm payment")
      }
    }
  }

  const handleMarkAsPaid = async (invoice: Invoice) => {
    if (confirm("Are you sure you want to mark this invoice as paid? This will generate a receipt.")) {
      try {
        const result = await markInvoiceAsPaid(invoice.id)

        // Update the invoice status in local state
        setInvoices(invoices.map(inv =>
          inv.id === invoice.id
            ? { ...inv, invoices_status: "paid", receipt_generated: true }
            : inv
        ))

        // Generate receipt PDF
        generateReceiptPDF(result.receipt)

        toast.success("Invoice marked as paid and receipt generated")
      } catch (error) {
        toast.error("Failed to mark invoice as paid")
      }
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">Manage and track all your invoices</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/invoices/create">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Invoices</CardDescription>
            <CardTitle className="text-3xl">{invoices.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Paid</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {invoices.filter((i) => i.invoices_status === "paid").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">
              {invoices.filter((i) => i.invoices_status === "pending").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Payment Pending</CardDescription>
            <CardTitle className="text-3xl text-amber-600">
              {invoices.filter((i) => i.invoices_status === "payment_pending").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Overdue</CardDescription>
            <CardTitle className="text-3xl text-red-600">
              {invoices.filter((i) => i.invoices_status === "overdue").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <div>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>A list of all your invoices and their status</CardDescription>
            </div>
            <div className="relative w-full max-w-sm min-w-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
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
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium mb-1">No invoices found</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get started by creating your first invoice.
                      </p>
                      <Button asChild size="sm">
                        <Link href="/dashboard/invoices/create">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Invoice
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        {invoice.invoice_number}
                      </div>
                    </TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell>{formatDate(invoice.created_at)}</TableCell>
                    <TableCell>{invoice.due_date ? formatDate(invoice.due_date) : "N/A"}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(invoice.total_amount)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.invoices_status)}</TableCell>
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
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/invoices/${invoice.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => generateInvoicePDF(invoice)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                          {invoice.invoices_status === "payment_pending" && (
                            <DropdownMenuItem onClick={() => handleConfirmManualPayment(invoice)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirm Payment
                            </DropdownMenuItem>
                          )}
                          {invoice.invoices_status !== "paid" && invoice.invoices_status !== "payment_pending" && (
                            <DropdownMenuItem onClick={() => handleMarkAsPaid(invoice)}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={async () => {
                              if (confirm("Are you sure you want to delete this invoice?")) {
                                try {
                                  await deleteInvoice(invoice.id)
                                  setInvoices(invoices.filter(i => i.id !== invoice.id))
                                  toast.success("Invoice deleted")
                                } catch (error) {
                                  toast.error("Failed to delete invoice")
                                }
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>Update the invoice details below.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Select Client (Optional)</Label>
                <Select value={selectedClientId} onValueChange={handleClientChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual entry</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name} - {client.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input id="customer_name" {...registerEdit("customer_name")} placeholder="John Doe" />
                {errorsEdit.customer_name && (
                  <p className="text-sm text-destructive">{errorsEdit.customer_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_email">Email</Label>
                <Input id="customer_email" type="email" {...registerEdit("customer_email")} placeholder="john@example.com" />
                {errorsEdit.customer_email && (
                  <p className="text-sm text-destructive">{errorsEdit.customer_email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="customer_phone">Phone (Optional)</Label>
                <Input id="customer_phone" {...registerEdit("customer_phone")} placeholder="+27 123 456 7890" />
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              {fieldsEdit.map((field, index) => (
                <div key={field.id} className="col-span-12 grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-4">
                    <Label>Item Name</Label>
                    <Input {...registerEdit(`items.${index}.name`)} placeholder="Item name" />
                    {errorsEdit.items?.[index]?.name && (
                      <p className="text-sm text-destructive">{errorsEdit.items[index].name.message}</p>
                    )}
                  </div>
                  <div className="col-span-4">
                    <Label>Description (Optional)</Label>
                    <Input {...registerEdit(`items.${index}.description`)} placeholder="Description" />
                  </div>
                  <div className="col-span-2">
                    <Label>Qty</Label>
                    <Input type="number" {...registerEdit(`items.${index}.quantity`, { valueAsNumber: true })} placeholder="1" />
                    {errorsEdit.items?.[index]?.quantity && (
                      <p className="text-sm text-destructive">{errorsEdit.items[index].quantity.message}</p>
                    )}
                  </div>
                  <div className="col-span-1">
                    <Label>Price</Label>
                    <Input type="number" step="0.01" {...registerEdit(`items.${index}.price`, { valueAsNumber: true })} placeholder="0.00" />
                    {errorsEdit.items?.[index]?.price && (
                      <p className="text-sm text-destructive">{errorsEdit.items[index].price.message}</p>
                    )}
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Button type="button" variant="outline" size="icon" onClick={() => removeEdit(index)} disabled={fieldsEdit.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="submit">Save</Button>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
