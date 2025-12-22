"use client"

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"

export default function CustomersPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md border-dashed">
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <CardTitle className="mb-2">No Customers Yet</CardTitle>
              <CardDescription>Add your first customer to get started</CardDescription>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
