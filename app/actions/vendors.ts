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

export async function getVendorProfile() {
  try {
    const supabase = await createClient()
    const vendorId = await getVendorId()

    const { data, error } = await supabase
      .from("vendors")
      .select(
        "vendor_id, name, email, phone, country, currency, payfast_merchant_id, payfast_merchant_key, payfast_connected, banking_details, last_login_at, created_at, updated_at"
      )
      .eq("vendor_id", vendorId)
      .single()

    if (error) {
      console.error("Error fetching vendor profile:", error)
      throw new Error("Failed to load vendor profile. Please try again.")
    }

    return data
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unexpected error occurred while loading vendor profile.")
  }
}

export async function updateVendorProfile(formData: {
  name?: string
  phone?: string
  country?: string
  currency?: string
}) {
  try {
    const supabase = await createClient()
    const vendorId = await getVendorId()

    const payload: any = {}
    if (formData.name !== undefined) payload.name = formData.name
    if (formData.phone !== undefined) payload.phone = formData.phone || null
    if (formData.country !== undefined) payload.country = formData.country
    if (formData.currency !== undefined) payload.currency = formData.currency

    const { data, error } = await supabase
      .from("vendors")
      .update(payload)
      .eq("vendor_id", vendorId)
      .select()
      .single()

    if (error) {
      console.error("Error updating vendor profile:", error)
      throw new Error("Failed to update profile. Please try again.")
    }

    return { success: true, data }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unexpected error occurred while updating profile.")
  }
}

export async function updateVendorBankingDetails(formData: {
  bank_name: string
  account_number: string
  branch_code: string
  account_holder: string
}) {
  try {
    const supabase = await createClient()
    const vendorId = await getVendorId()

    const payload = {
      banking_details: {
        bank_name: formData.bank_name,
        account_number: formData.account_number,
        branch_code: formData.branch_code,
        account_holder: formData.account_holder,
      },
    }

    const { data, error } = await supabase
      .from("vendors")
      .update(payload)
      .eq("vendor_id", vendorId)
      .select()
      .single()

    if (error) {
      console.error("Error updating vendor banking details:", error)
      throw new Error("Failed to update banking details. Please try again.")
    }

    return { success: true, data }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error("An unexpected error occurred while updating banking details.")
  }
}