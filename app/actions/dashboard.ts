"use server"

import { createClient } from "@/lib/supabase/server"

async function getVendorId(supabase: any, user: any) {
  const { data, error } = await supabase
    .from("vendors")
    .select("vendor_id")
    .eq("email", user.email)
    .single()

  if (error) throw error
  return data.vendor_id
}

export async function getDashboardStats() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const vendorId = await getVendorId(supabase, user)

  // Get invoice stats
  const { data: invoices } = await supabase
    .from("invoices")
    .select("total_amount, invoices_status, created_at")
    .eq("vendor_id", vendorId)

  const totalInvoices = invoices?.length || 0
  const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
  const paidInvoices = invoices?.filter(inv => inv.invoices_status === 'paid').length || 0

  // Get QR codes count (assuming products with qr_code_url)
  const { data: products } = await supabase
    .from("products")
    .select("id")
    .eq("vendor_id", vendorId)
    .not("qr_code_url", "is", null)

  const qrCodesGenerated = products?.length || 0

  // Get customers count (clients)
  const { data: clients } = await supabase
    .from("clients")
    .select("id")

  const activeCustomers = clients?.length || 0

  // Recent invoices
  const { data: recentInvoices } = await supabase
    .from("invoices")
    .select("id, invoice_number, customer_name, total_amount, invoices_status, created_at")
    .eq("vendor_id", vendorId)
    .order("created_at", { ascending: false })
    .limit(5)

  return {
    totalInvoices,
    totalRevenue,
    qrCodesGenerated,
    activeCustomers,
    recentInvoices: recentInvoices || [],
  }
}