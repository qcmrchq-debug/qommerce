import type React from "react"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { ClientSidebar, ClientMobileMenu } from "@/components/client-sidebar"

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/login")
  }

  // Check vendor existence directly (do not call vendor helpers)
  const { data: vendorRow, error: vendorError } = await supabase
    .from("vendors")
    .select("vendor_id")
    .eq("email", user.email)
    .maybeSingle()

  if (vendorError) {
    throw new Error(vendorError.message || String(vendorError))
  }

  if (vendorRow && vendorRow.vendor_id) {
    // This is a vendor account, send them to the vendor dashboard
    redirect("/dashboard")
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader user={user} mobileMenu={<ClientMobileMenu />} />
      <div className="flex flex-1 overflow-hidden">
        <ClientSidebar />
        <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
      </div>
    </div>
  )
}
