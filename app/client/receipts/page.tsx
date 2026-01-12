import { getClientReceipts } from "@/app/actions/clients"

export default async function ClientReceiptsPage() {
  const receipts = await getClientReceipts()

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-bold">Your Receipts</h1>
        <p className="text-muted-foreground">All receipts issued to you</p>
      </div>

      <div className="mt-6 bg-card rounded-md shadow-sm">
        <ul>
          {receipts.map((r: any) => (
            <li key={r.id} className="py-4 px-4 border-b border-border flex justify-between items-center">
              <div>
                <div className="font-medium">{r.receipt_number ?? `#${r.id}`}</div>
                <div className="text-sm text-muted-foreground">{r.customer_name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{r.amount_paid}</div>
                <div className="text-sm text-muted-foreground">{r.payment_method}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
