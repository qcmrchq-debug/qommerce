"use client"

import React from "react"
import ClientSettingsForm from "./ClientSettingsForm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export default function ClientSettingsClient({ initialClient }: { initialClient: any }) {
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>View and update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientSettingsForm initial={initialClient} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleLogout}>Log out</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
