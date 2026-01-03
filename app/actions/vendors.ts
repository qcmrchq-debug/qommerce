"use server"

import { createClient } from "@/lib/supabase/server"

export async function getVendorId() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user?.email) {
    throw new Error("Unauthenticated: cannot resolve vendor")
  }

  const { data, error } = await supabase
    .from("vendors")
    .select("vendor_id")
    .eq("email", user.email)
    .single()

  if (error || !data?.vendor_id) {
    throw new Error("Vendor not found for authenticated user")
  }

  return data.vendor_id
}
