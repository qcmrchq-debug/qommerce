"use server"

import { createClient } from "@/lib/supabase/server"

export type ClientContext = {
  client_id: number | null
  email: string
  client?: any
}

export async function getClientContext(): Promise<ClientContext> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user?.email) {
    throw new Error("Unauthenticated: cannot resolve client")
  }

  // If a vendor row exists for this email, this is not a client
  const { data: vendorRow, error: vendorError } = await supabase
    .from("vendors")
    .select("vendor_id")
    .eq("email", user.email)
    .maybeSingle()

  if (vendorError) {
    // If there's an error fetching vendor, propagate as an Error instance
    throw new Error(vendorError.message || String(vendorError))
  }

  if (vendorRow && vendorRow.vendor_id) {
    throw new Error("User is a vendor")
  }

  // Try to find a client row
  const { data: clientRow, error: clientError } = await supabase
    .from("clients")
    .select("id,email,name,company,phone")
    .eq("email", user.email)
    .maybeSingle()

  if (clientError) {
    // If there's an unexpected error, throw as an Error instance
    throw new Error(clientError.message || String(clientError))
  }

  return {
    client_id: clientRow?.id ?? null,
    email: user.email,
    client: clientRow ?? undefined,
  }
}

export async function getClientInvoices() {
  const supabase = await createClient()
  const ctx = await getClientContext()

  const { client_id, email } = ctx

  let query = supabase.from("invoices").select("*")

  if (client_id) {
    // client_id or matching customer_email
    query = query.or(`client_id.eq.${client_id},customer_email.eq.${email}`)
  } else {
    query = query.eq("customer_email", email)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw new Error(error.message || String(error))

  return data
}

export async function getClientReceipts() {
  const supabase = await createClient()
  const ctx = await getClientContext()

  const { client_id, email } = ctx

  let query = supabase.from("receipts").select("*")

  if (client_id) {
    query = query.or(`client_id.eq.${client_id},customer_email.eq.${email}`)
  } else {
    query = query.eq("customer_email", email)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw new Error(error.message || String(error))

  return data
}

export async function getClientUnpaidInvoices() {
  const supabase = await createClient()
  const ctx = await getClientContext()

  const { client_id, email } = ctx

  let query = supabase.from("invoices").select("*")

  if (client_id) {
    query = query
      .or(`client_id.eq.${client_id},customer_email.eq.${email}`)
      .neq("invoices_status", "paid")
  } else {
    query = query.eq("customer_email", email).neq("invoices_status", "paid")
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) throw new Error(error.message || String(error))

  return data
}

export async function getClientInvoiceById(invoiceId: number) {
  const supabase = await createClient()
  const ctx = await getClientContext()

  const { client_id, email } = ctx

  // Fetch invoice by id and ensure ownership
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .maybeSingle()

  if (error) throw new Error(error.message || String(error))
  if (!invoice) return null

  const owns = (client_id && invoice.client_id === client_id) || invoice.customer_email === email

  if (!owns) return null

  return invoice
}

export async function getClientPaidInvoices() {
  const supabase = await createClient()
  const ctx = await getClientContext()
  const { client_id, email } = ctx

  let query = supabase.from("invoices").select("*")

  if (client_id) {
    query = query.or(`client_id.eq.${client_id},customer_email.eq.${email}`).eq("invoices_status", "paid")
  } else {
    query = query.eq("customer_email", email).eq("invoices_status", "paid")
  }

  const { data, error } = await query.order("created_at", { ascending: false })
  if (error) throw new Error(error.message || String(error))
  return data
}

export async function updateClientProfile(formData: { name: string; company?: string; phone?: string }) {
  const supabase = await createClient()
  const ctx = await getClientContext()
  const { client_id, email } = ctx

  const payload: any = {
    name: formData.name,
    company: formData.company || null,
    phone: formData.phone || null,
    last_login_at: new Date().toISOString(),
  }

  if (client_id) {
    const { data, error } = await supabase
      .from("clients")
      .update(payload)
      .eq("id", client_id)
      .select()
      .single()

    if (error) throw new Error(error.message || String(error))
    return data
  } else {
    // Try update by email first
    const { data: updated, error: updateError } = await supabase
      .from("clients")
      .update(payload)
      .eq("email", email)
      .select()
      .single()

    if (updateError && updateError.code !== "PGRST116") {
      throw new Error(updateError.message || String(updateError))
    }

    if (updated) return updated

    // Insert a new client row if none exists
    const { data: inserted, error: insertError } = await supabase
      .from("clients")
      .insert({ email, ...payload })
      .select()
      .single()

    if (insertError) throw new Error(insertError.message || String(insertError))
    return inserted
  }
}