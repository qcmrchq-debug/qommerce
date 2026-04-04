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
  let isVendor = false
  try {
    const { data: vendorRow } = await supabase
      .from("vendors")
      .select("vendor_id")
      .eq("email", user.email)
      .maybeSingle()
    isVendor = !!(vendorRow?.vendor_id)
  } catch {
    isVendor = false
  }

  if (isVendor) {
    throw new Error("User is a vendor")
  }

  // Try to find a client row
  const { data: clientRow, error: clientError } = await supabase
    .from("clients")
    .select("id,email,name,company,phone")
    .eq("email", user.email)
    .maybeSingle()

  if (clientError) {
    console.error("Error fetching client:", clientError)
    throw new Error("Failed to load client information. Please try again.")
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

  if (error) {
    console.error("Error fetching client invoices:", error)
    throw new Error("Failed to load invoices. Please try again.")
  }

  return data || []
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

  if (error) {
    console.error("Error fetching client receipts:", error)
    throw new Error("Failed to load receipts. Please try again.")
  }

  return data || []
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

  if (error) {
    console.error("Error fetching unpaid invoices:", error)
    throw new Error("Failed to load unpaid invoices. Please try again.")
  }

  return data || []
}

export async function getClientInvoiceById(invoiceId: number) {
  try {
    const supabase = await createClient()
    const ctx = await getClientContext()

    const { client_id, email } = ctx

    // Fetch invoice by id with vendor_id to ensure proper access control
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("*, vendor_id, vendors!inner(name, email, phone, country, banking_details)")
      .eq("id", invoiceId)
      .maybeSingle()

    if (error) {
      console.error("Error fetching invoice:", error)
      throw new Error("Failed to load invoice. Please try again.")
    }

    if (!invoice) {
      return null
    }

    // Verify ownership: must match client_id OR customer_email, AND must be from a valid vendor
    const owns = (client_id && invoice.client_id === client_id) || invoice.customer_email === email

    if (!owns) {
      // Don't reveal that invoice exists if user doesn't own it
      return null
    }

    // Additional security: verify vendor_id exists (prevents access to invoices from deleted vendors)
    if (!invoice.vendor_id) {
      console.error("Invoice has no vendor_id:", invoiceId)
      return null
    }

    return invoice
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unexpected error occurred while loading the invoice.")
  }
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
  if (error) {
    console.error("Error fetching paid invoices:", error)
    throw new Error("Failed to load paid invoices. Please try again.")
  }
  return data || []
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

    if (error) {
      console.error("Error updating client profile:", error)
      throw new Error("Failed to update profile. Please try again.")
    }
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
      console.error("Error updating client by email:", updateError)
      throw new Error("Failed to update profile. Please try again.")
    }

    if (updated) return updated

    // Insert a new client row if none exists
    const { data: inserted, error: insertError } = await supabase
      .from("clients")
      .insert({ email, ...payload })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating client profile:", insertError)
      throw new Error("Failed to create profile. Please try again.")
    }
    return inserted
  }
}
