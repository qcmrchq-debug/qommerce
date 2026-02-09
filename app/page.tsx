import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !user.email) {
    redirect("/login")
  }

  // Check if user is a vendor or client in the database
  const { data: vendorRow } = await supabase
    .from("vendors")
    .select("vendor_id")
    .eq("email", user.email)
    .maybeSingle()

  if (vendorRow?.vendor_id) {
    redirect("/dashboard")
  }

  // Check if user is a client
  const { data: clientRow } = await supabase
    .from("clients")
    .select("id")
    .eq("email", user.email)
    .maybeSingle()

  if (clientRow?.id) {
    redirect("/client")
  }

  // User exists in auth but not in either table - redirect to login
  redirect("/login")
}
