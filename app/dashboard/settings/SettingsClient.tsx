"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { getVendorProfile, updateVendorProfile } from "@/app/actions/vendors"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface VendorProfile {
  vendor_id: number
  name: string
  email: string
  phone: string | null
  country: string
  currency: string
}

interface ProfileFormData {
  name: string
  phone: string
}

export default function SettingsClient({ initialProfile }: { initialProfile: VendorProfile | null }) {
  const [profile, setProfile] = useState<VendorProfile | null>(initialProfile)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  useEffect(() => {
    if (profile) {
      resetProfile({
        name: profile.name || "",
        phone: profile.phone || "",
      })
    }
  }, [profile, resetProfile])

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      const result = await updateVendorProfile({
        name: data.name,
        phone: data.phone || null,
      })

      if (result.success) {
        toast.success("Profile updated successfully")
        // Refresh profile data
        const updated = await getVendorProfile()
        setProfile(updated)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
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

        <Card className="opacity-75">
          <CardHeader>
            <CardTitle>Payment Integration</CardTitle>
            <CardDescription>Configure payment gateways for QR code generation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed bg-muted/50 px-4 py-6 text-center">
              <p className="text-sm font-medium">Coming soon</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Payment gateway integration will be available in a future update.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
