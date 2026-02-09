"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function signUpVendor(formData: {
  email: string
  password: string
  name: string
  phone?: string
  country?: string
  currency?: string
}) {
  const supabase = await createClient()

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
        user_type: "vendor",
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Failed to create user" }
  }

  // Insert into vendors table
  const { error: dbError } = await supabase.from("vendors").insert({
    name: formData.name,
    email: formData.email,
    password_hash: authData.user.id, // Store auth user ID as reference
    phone: formData.phone || null,
    country: formData.country || "ZA",
    currency: formData.currency || "ZAR",
    last_login_at: new Date().toISOString(),
  })

  if (dbError) {
    console.error(" Error inserting vendor:", dbError)
    return { error: "Failed to create vendor profile" }
  }

  return { success: true }
}

export async function signUpClient(formData: {
  email: string
  password: string
  name: string
  company?: string
  phone?: string
}) {
  const supabase = await createClient()

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.name,
        user_type: "client",
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: "Failed to create user" }
  }

  // Insert into clients table
  const { error: dbError } = await supabase.from("clients").insert({
    name: formData.name,
    email: formData.email,
    password_hash: authData.user.id, // Store auth user ID as reference
    company: formData.company || null,
    phone: formData.phone || null,
    last_login_at: new Date().toISOString(),
    is_verified: false,
  })

  if (dbError) {
    console.error(" Error inserting client:", dbError)
    return { error: "Failed to create client profile" }
  }

  return { success: true }
}

export async function signIn(email: string, password: string, userType: "vendor" | "client") {
  const supabase = await createClient()

  const { data, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!data.user) {
    return { error: "Failed to sign in" }
  }

  // Validate user type against database records
  const { data: vendorRow } = await supabase
    .from("vendors")
    .select("vendor_id")
    .eq("email", email)
    .maybeSingle()

  const { data: clientRow } = await supabase
    .from("clients")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  const isVendor = !!vendorRow?.vendor_id
  const isClient = !!clientRow?.id

  // Determine actual user type from database
  let actualUserType: "vendor" | "client" | null = null
  if (isVendor && !isClient) {
    actualUserType = "vendor"
  } else if (isClient && !isVendor) {
    actualUserType = "client"
  } else if (isVendor && isClient) {
    // User exists in both tables - prioritize vendor
    actualUserType = "vendor"
  }

  if (!actualUserType) {
    return { error: "Account not found. Please ensure you have completed the signup process." }
  }

  // Verify selected user type matches actual user type
  if (userType !== actualUserType) {
    return { 
      error: `This account is registered as a ${actualUserType}. Please select the correct account type.` 
    }
  }

  // Update user metadata with validated user type
  const { error: updateError } = await supabase.auth.updateUser({
    data: { user_type: actualUserType },
  })

  if (updateError) {
    console.error(" Error updating user metadata:", updateError)
  }

  // Update last_login_at in the appropriate table
  if (actualUserType === "vendor") {
    await supabase.from("vendors").update({ last_login_at: new Date().toISOString() }).eq("email", email)
  } else {
    await supabase.from("clients").update({ last_login_at: new Date().toISOString() }).eq("email", email)
  }

  return { success: true, userType: actualUserType }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
