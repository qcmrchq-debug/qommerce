"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { formatCurrency } from "@/lib/utils"
import { buildPayFastPaymentData } from "@/app/actions/payfast"
import { toast } from "sonner"
import { Loader2, CreditCard, Building2 } from "lucide-react"
import Link from "next/link"

interface PaymentClientProps {
  invoice: {
    id: number
    invoice_number: string
    customer_name: string
    customer_email: string
    total_amount: number
    items: any[]
    subtotal: number
    tax_amount: number
    invoices_status: string
    vendors?: {
      banking_details?: {
        bank_name?: string | null
        account_number?: string | null
        branch_code?: string | null
        account_holder?: string | null
        swift_code?: string | null
      } | null
      mobile_money?: {
        full_name?: string | null
        country?: string | null
        mobile_number?: string | null
      } | null
    } | null
  }
}

type PayMethod = "manual" | "payfast" | "mobile_money"

export default function PaymentClient({ invoice }: PaymentClientProps) {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>("manual")
  const [isProcessing, setIsProcessing] = useState(false)
  const [manualInitiated, setManualInitiated] = useState(false)
  const [payfastError, setPayfastError] = useState<string | null>(null)

  const bankDetails = invoice.vendors?.banking_details
  const mobileMoneyDetails = invoice.vendors?.mobile_money
  const hasMobileMoney = Boolean(
    mobileMoneyDetails?.full_name?.trim() &&
    mobileMoneyDetails?.country?.trim() &&
    mobileMoneyDetails?.mobile_number?.trim()
  )

  const bankTransferInstructions = bankDetails
    ? `Bank Transfer

1. Transfer the invoice amount to:
   Bank: ${bankDetails.bank_name || "N/A"}
   Account: ${bankDetails.account_number || "N/A"}
   Branch: ${bankDetails.branch_code || "N/A"}
   Account Holder: ${bankDetails.account_holder || "N/A"}
   SWIFT Code: ${bankDetails.swift_code || "N/A"}
   Reference: [Your invoice number]

2. Email proof of payment to your vendor.

3. Your vendor will confirm receipt and mark the invoice as paid.

You will receive a receipt once payment is confirmed.`
    : "This vendor has not set up banking details yet."

  const mobileMoneyInstructions = mobileMoneyDetails
    ? `Mobile Money

1. Send payment to:
   Full Name: ${mobileMoneyDetails.full_name || "N/A"}
   Country: ${mobileMoneyDetails.country || "N/A"}
   Mobile Number: ${mobileMoneyDetails.mobile_number || "N/A"}
   Reference: [Your invoice number]

2. Email proof of payment to your vendor.

3. Your vendor will confirm receipt and mark the invoice as paid.

You will receive a receipt once payment is confirmed.`
    : "This vendor has not set up mobile money details yet."

  const submitPayFastForm = (actionUrl: string, formData: Record<string, string>) => {
    const form = document.createElement("form")
    form.method = "POST"
    form.action = actionUrl
    form.style.display = "none"

    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = key
      input.value = value
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    setPayfastError(null)

    try {
      if (paymentMethod === "payfast") {
        try {
          const result = await buildPayFastPaymentData(invoice.id)
          submitPayFastForm(result.payfastUrl, result.formData)
          return
        } catch (error) {
          setPayfastError("PayFast is not available for this invoice. Please use bank transfer instead.")
          setIsProcessing(false)
          return
        }
      }

      setManualInitiated(true)
      toast.success("Payment initiated. Follow the instructions below.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to initiate payment. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (manualInitiated) {
    return (
      <div className="space-y-6 p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
            <CardDescription>
              Complete your payment instructions for invoice {invoice.invoice_number}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 whitespace-pre-wrap text-sm font-mono">
              {paymentMethod === "mobile_money" ? mobileMoneyInstructions : bankTransferInstructions}
            </div>
            <p className="text-sm text-muted-foreground">
              Your invoice is marked as payment pending. You will receive a receipt once your vendor confirms payment.
            </p>
            <Button variant="outline" asChild>
              <Link href={`/client/invoices/${invoice.id}`}>Back to Invoice</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Pay Invoice</h1>
        <p className="text-muted-foreground">Complete your payment for invoice {invoice.invoice_number}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Review your invoice before payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Invoice Number</Label>
              <p className="font-medium">{invoice.invoice_number}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Customer</Label>
              <p className="font-medium">{invoice.customer_name}</p>
              <p className="text-sm text-muted-foreground">{invoice.customer_email}</p>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(invoice.total_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>Select how you would like to pay</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={paymentMethod} onValueChange={(v) => {
              setPaymentMethod(v as PayMethod)
              setPayfastError(null)
            }}>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-sm text-muted-foreground">Pay by bank transfer</div>
                    </div>
                  </div>
                </Label>
              </div>

              {hasMobileMoney && (
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="mobile_money" id="mobile_money" />
                  <Label htmlFor="mobile_money" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Mobile Money</div>
                        <div className="text-sm text-muted-foreground">Pay using mobile money details</div>
                      </div>
                    </div>
                  </Label>
                </div>
              )}

              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                <RadioGroupItem value="payfast" id="payfast" />
                <Label htmlFor="payfast" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Pay via PayFast</div>
                      <div className="text-sm text-muted-foreground">Redirect to PayFast to complete payment</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {payfastError && paymentMethod === "payfast" && (
              <Alert variant="destructive">
                <AlertDescription>{payfastError}</AlertDescription>
              </Alert>
            )}

            {paymentMethod === "manual" && (
              <div className="rounded-lg border border-muted/50 bg-muted p-4 text-sm">
                {bankDetails ? (
                  <div className="space-y-2">
                    <p className="font-medium">Banking details for this vendor:</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <Label className="text-muted-foreground">Bank Name</Label>
                        <p className="font-medium">{bankDetails.bank_name || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Account Number</Label>
                        <p className="font-medium">{bankDetails.account_number || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Branch Code</Label>
                        <p className="font-medium">{bankDetails.branch_code || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Account Holder</Label>
                        <p className="font-medium">{bankDetails.account_holder || "-"}</p>
                      </div>
                      {bankDetails.swift_code && (
                        <div>
                          <Label className="text-muted-foreground">SWIFT Code</Label>
                          <p className="font-medium">{bankDetails.swift_code}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This vendor has not set up banking details yet.
                  </p>
                )}
              </div>
            )}

            {paymentMethod === "mobile_money" && (
              <div className="rounded-lg border border-muted/50 bg-muted p-4 text-sm">
                {mobileMoneyDetails ? (
                  <div className="space-y-2">
                    <p className="font-medium">Mobile money details for this vendor:</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <Label className="text-muted-foreground">Full Name</Label>
                        <p className="font-medium">{mobileMoneyDetails.full_name || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Country</Label>
                        <p className="font-medium">{mobileMoneyDetails.country || "-"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Mobile Number</Label>
                        <p className="font-medium">{mobileMoneyDetails.mobile_number || "-"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This vendor has not set up mobile money details yet.
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handlePayment}
              className="w-full"
              size="lg"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === "payfast" ? (
                `Pay ${formatCurrency(invoice.total_amount)} with PayFast`
              ) : (
                `Initiate Manual Payment`
              )}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.back()}
              disabled={isProcessing}
              asChild
            >
              <Link href={`/client/invoices/${invoice.id}`}>Cancel</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
