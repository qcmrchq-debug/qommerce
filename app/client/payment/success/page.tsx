import Link from "next/link"

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl border bg-card p-10 shadow-lg">
        <h1 className="text-4xl font-bold">Payment Submitted</h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Your payment is being processed. Your invoice will be marked as paid once confirmed by PayFast.
          You can close this page.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/client/invoices" className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            Back to Invoices
          </Link>
        </div>
      </div>
    </div>
  )
}
