"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { createInvoice } from "@/app/actions/invoices"
import { toast } from "sonner"

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number().min(0, "Price must be positive"),
})

const invoiceSchema = z.object({
  customer_name: z.string().min(1, "Customer name is required"),
  customer_email: z.string().email("Invalid email"),
  customer_phone: z.string().optional(),
  due_date: z.string().optional(),
  items: z.array(itemSchema).min(1, "At least one item is required"),
})

type InvoiceForm = z.infer<typeof invoiceSchema>

export default function CreateInvoicePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      items: [{ name: "", description: "", quantity: 1, price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  })

  const watchedItems = watch("items")
  const subtotal = watchedItems?.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0) || 0
  const taxRate = 0.15 // 15% tax
  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  const onSubmit = async (data: InvoiceForm) => {
    setIsLoading(true)
    try {
      await createInvoice({
        ...data,
        subtotal,
        tax_amount: taxAmount,
        total_amount: total,
      })
      toast.success("Invoice created successfully")
      router.push("/dashboard/invoices")
    } catch (error) {
      toast.error("Failed to create invoice")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Invoice</h2>
        <p className="text-muted-foreground">Create a new invoice for your customer</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
            <CardDescription>Enter the customer's details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  {...register("customer_name")}
                  placeholder="John Doe"
                />
                {errors.customer_name && (
                  <p className="text-sm text-destructive">{errors.customer_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  {...register("customer_email")}
                  placeholder="john@example.com"
                />
                {errors.customer_email && (
                  <p className="text-sm text-destructive">{errors.customer_email.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_phone">Phone (Optional)</Label>
                <Input
                  id="customer_phone"
                  {...register("customer_phone")}
                  placeholder="+27 123 456 7890"
                />
              </div>
              <div>
                <Label htmlFor="due_date">Due Date (Optional)</Label>
                <Input
                  id="due_date"
                  type="date"
                  {...register("due_date")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Items</CardTitle>
            <CardDescription>Add the items for this invoice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-3">
                  <Label>Item Name</Label>
                  <Input
                    {...register(`items.${index}.name`)}
                    placeholder="Item name"
                  />
                  {errors.items?.[index]?.name && (
                    <p className="text-sm text-destructive">{errors.items[index].name.message}</p>
                  )}
                </div>
                <div className="col-span-3">
                  <Label>Description (Optional)</Label>
                  <Input
                    {...register(`items.${index}.description`)}
                    placeholder="Description"
                  />
                </div>
                <div className="col-span-2">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-destructive">{errors.items[index].quantity.message}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`items.${index}.price`, { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.items?.[index]?.price && (
                    <p className="text-sm text-destructive">{errors.items[index].price.message}</p>
                  )}
                </div>
                <div className="col-span-1">
                  <Label>Total</Label>
                  <Input
                    value={((watchedItems?.[index]?.quantity || 0) * (watchedItems?.[index]?.price || 0)).toFixed(2)}
                    readOnly
                  />
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: "", description: "", quantity: 1, price: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (15%):</span>
                <span>R{taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>R{total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Invoice"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}