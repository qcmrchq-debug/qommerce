"use client"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Receipt } from "lucide-react"

export default function ReceiptsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Receipts</h2>
        <p className="text-muted-foreground">Auto-generated receipts for all transactions</p>
      </div>

      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md border-dashed">
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Receipt className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <CardTitle className="mb-2">No Receipts Available</CardTitle>
              <CardDescription>Receipts will appear here once payments are processed</CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
