import type React from "react"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar, DashboardMobileMenu } from "@/components/dashboard-sidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect("/login")
  }

  // Verify user is actually a vendor in the database
  const { data: vendorRow, error: vendorError } = await supabase
    .from("vendors")
    .select("vendor_id")
    .eq("email", user.email)
    .maybeSingle()

  if (vendorError) {
    throw new Error("Failed to verify vendor account")
  }

  if (!vendorRow || !vendorRow.vendor_id) {
    // Not a vendor, redirect to client dashboard or login
    redirect("/login")
  }

  return (
    <div className="flex h-screen flex-col">
      <DashboardHeader user={user} mobileMenu={<DashboardMobileMenu />} />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
      </div>
    </div>
  )
}
