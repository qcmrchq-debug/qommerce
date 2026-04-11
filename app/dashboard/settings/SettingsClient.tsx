"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { getVendorProfile, updateVendorProfile, updateVendorBankingDetails } from "@/app/actions/vendors"
import { savePayFastCredentials } from "@/app/actions/payfast"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"

interface VendorProfile {
  vendor_id: number
  name: string
  email: string
  phone: string | null
  country: string
  currency: string
  payfast_merchant_id?: string | null
  payfast_merchant_key?: string | null
  payfast_connected?: boolean | null
  banking_details?: {
    bank_name?: string | null
    account_number?: string | null
    branch_code?: string | null
    account_holder?: string | null
  } | null
}

interface ProfileFormData {
  name: string
  phone: string
}

interface BankingFormData {
  bank_name: string
  account_number: string
  branch_code: string
  account_holder: string
}

export default function SettingsClient({ initialProfile }: { initialProfile: VendorProfile | null }) {
  const [profile, setProfile] = useState<VendorProfile | null>(initialProfile)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingBanking, setIsSavingBanking] = useState(false)
  const [isSavingPayFast, setIsSavingPayFast] = useState(false)
  const [payfastConnected, setPayfastConnected] = useState<boolean>(initialProfile?.payfast_connected ?? false)
  const [showPayFastForm, setShowPayFastForm] = useState<boolean>(!(initialProfile?.payfast_connected ?? false))
  const [merchantId, setMerchantId] = useState(initialProfile?.payfast_merchant_id || "")
  const [merchantKey, setMerchantKey] = useState(initialProfile?.payfast_merchant_key || "")
  const [passphrase, setPassphrase] = useState("")
  const [showPassphrase, setShowPassphrase] = useState(false)

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: errorsProfile },
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: profile?.name || "",
      phone: profile?.phone || "",
    },
  })

  const {
    register: registerBanking,
    handleSubmit: handleSubmitBanking,
    reset: resetBanking,
    formState: { errors: errorsBanking },
  } = useForm<BankingFormData>({
    defaultValues: {
      bank_name: profile?.banking_details?.bank_name || "",
      account_number: profile?.banking_details?.account_number || "",
      branch_code: profile?.banking_details?.branch_code || "",
      account_holder: profile?.banking_details?.account_holder || "",
    },
  })

  useEffect(() => {
    if (profile) {
      resetProfile({
        name: profile.name || "",
        phone: profile.phone || "",
      })
      resetBanking({
        bank_name: profile.banking_details?.bank_name || "",
        account_number: profile.banking_details?.account_number || "",
        branch_code: profile.banking_details?.branch_code || "",
        account_holder: profile.banking_details?.account_holder || "",
      })
    }
  }, [profile, resetProfile, resetBanking])

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile)
      setPayfastConnected(initialProfile.payfast_connected ?? false)
      setShowPayFastForm(!(initialProfile.payfast_connected ?? false))
      setMerchantId(initialProfile.payfast_merchant_id || "")
      setMerchantKey(initialProfile.payfast_merchant_key || "")
      setPassphrase("")
    }
  }, [initialProfile])

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      const result = await updateVendorProfile({
        name: data.name,
        phone: data.phone || null,
      })

      if (result.success) {
        toast.success("Profile updated successfully")
        const updated = await getVendorProfile()
        setProfile(updated)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const onBankingSubmit = async (data: BankingFormData) => {
    setIsSavingBanking(true)
    try {
      const result = await updateVendorBankingDetails({
        bank_name: data.bank_name,
        account_number: data.account_number,
        branch_code: data.branch_code,
        account_holder: data.account_holder,
      })

      if (result.success) {
        toast.success("Banking details saved successfully")
        const updated = await getVendorProfile()
        setProfile(updated)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save banking details")
    } finally {
      setIsSavingBanking(false)
    }
  }

  const handlePayFastSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!profile) return

    if (!merchantId.trim() || !merchantKey.trim() || !passphrase.trim()) {
      toast.error("All PayFast fields are required")
      return
    }

    setIsSavingPayFast(true)

    try {
      await savePayFastCredentials(profile.vendor_id, merchantId.trim(), merchantKey.trim(), passphrase.trim())
      toast.success("PayFast credentials saved successfully")
      setPayfastConnected(true)
      setShowPayFastForm(false)
      setPassphrase("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save PayFast credentials")
    } finally {
      setIsSavingPayFast(false)
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and business settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details and business information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    {...registerProfile("name", { required: "Business name is required" })}
                  />
                  {errorsProfile.name && (
                    <p className="text-sm text-destructive">{errorsProfile.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={profile.email} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" {...registerProfile("phone")} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" value={profile.country || "ZA"} disabled />
                  <p className="text-xs text-muted-foreground">Country cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" value={profile.currency || "ZAR"} disabled />
                  <p className="text-xs text-muted-foreground">Currency cannot be changed</p>
                </div>
              </div>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banking Details</CardTitle>
            <CardDescription>Save your bank account information for manual payments</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitBanking(onBankingSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    {...registerBanking("bank_name", { required: "Bank name is required" })}
                  />
                  {errorsBanking.bank_name && (
                    <p className="text-sm text-destructive">{errorsBanking.bank_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    {...registerBanking("account_number", { required: "Account number is required" })}
                  />
                  {errorsBanking.account_number && (
                    <p className="text-sm text-destructive">{errorsBanking.account_number.message}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="branch_code">Branch Code</Label>
                  <Input
                    id="branch_code"
                    {...registerBanking("branch_code", { required: "Branch code is required" })}
                  />
                  {errorsBanking.branch_code && (
                    <p className="text-sm text-destructive">{errorsBanking.branch_code.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account_holder">Account Holder Name</Label>
                  <Input
                    id="account_holder"
                    {...registerBanking("account_holder", { required: "Account holder name is required" })}
                  />
                  {errorsBanking.account_holder && (
                    <p className="text-sm text-destructive">{errorsBanking.account_holder.message}</p>
                  )}
                </div>
              </div>
              <Button type="submit" disabled={isSavingBanking}>
                {isSavingBanking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Banking Details"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PayFast Integration</CardTitle>
            <CardDescription>Connect your PayFast account to receive payments from customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {payfastConnected ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900">
                  <p className="font-medium">PayFast Connected ✓</p>
                  <p className="text-sm text-green-800">
                    Your gateway is connected. Update credentials if you need to rotate them.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPayFastForm((current) => !current)}
                >
                  {showPayFastForm ? "Hide Credentials" : "Update Credentials"}
                </Button>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm text-muted-foreground">
                Connect your PayFast account to receive payments from customers.
              </div>
            )}

            {showPayFastForm && (
              <form onSubmit={handlePayFastSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="merchant_id">Merchant ID</Label>
                    <Input
                      id="merchant_id"
                      value={merchantId}
                      onChange={(event) => setMerchantId(event.target.value)}
                      placeholder="Enter your PayFast merchant ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merchant_key">Merchant Key</Label>
                    <Input
                      id="merchant_key"
                      value={merchantKey}
                      onChange={(event) => setMerchantKey(event.target.value)}
                      placeholder="Enter your PayFast merchant key"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passphrase">Passphrase</Label>
                  <div className="relative">
                    <Input
                      id="passphrase"
                      type={showPassphrase ? "text" : "password"}
                      value={passphrase}
                      onChange={(event) => setPassphrase(event.target.value)}
                      placeholder="Enter your PayFast passphrase"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassphrase(!showPassphrase)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassphrase ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Passphrase is stored securely and will never be shown again.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={isSavingPayFast}>
                    {isSavingPayFast ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : payfastConnected ? (
                      "Update PayFast Credentials"
                    ) : (
                      "Connect PayFast"
                    )}
                  </Button>
                  {payfastConnected && (
                    <Button variant="outline" type="button" onClick={() => setShowPayFastForm(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Settings</CardTitle>
            <CardDescription>Configure default invoice settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prefix">Invoice Prefix</Label>
                <Input id="prefix" defaultValue="INV" disabled />
                <p className="text-xs text-muted-foreground">Invoice prefix is managed automatically</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Payment Terms (days)</Label>
                <Input id="terms" type="number" defaultValue="30" disabled />
                <p className="text-xs text-muted-foreground">Payment terms can be set per invoice</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Default Invoice Notes</Label>
              <Input id="notes" placeholder="Thank you for your business" disabled />
              <p className="text-xs text-muted-foreground">Default notes can be added when creating invoices</p>
            </div>
            <Button variant="outline" disabled>
              Save Settings
            </Button>
            <p className="text-xs text-muted-foreground">
              Invoice settings will be configurable in a future update
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
