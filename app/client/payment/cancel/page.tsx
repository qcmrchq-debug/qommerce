import Link from "next/link"

export default function PaymentCancelPage({ searchParams }: { searchParams?: { invoice?: string } }) {
  const invoiceId = searchParams?.invoice

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl border bg-card p-10 shadow-lg">
        <h1 className="text-4xl font-bold">Payment Cancelled</h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Your payment was not completed. No charges were made.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          {invoiceId ? (
            <Link
              href={`/client/pay/${invoiceId}`}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Try Again
            </Link>
          ) : null}
          <Link href="/client/invoices" className="inline-flex items-center justify-center rounded-lg border border-input px-5 py-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">
            View Invoices
          </Link>
        </div>
      </div>
    </div>
  )
}
