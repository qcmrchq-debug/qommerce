"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Receipt, Eye, EyeOff } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Link from "next/link"
import { signUpVendor, signUpClient } from "@/app/actions/auth"

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [userType, setUserType] = useState<"vendor" | "client">("vendor")
  const [showVendorPassword, setShowVendorPassword] = useState(false)
  const [showVendorConfirm, setShowVendorConfirm] = useState(false)
  const [showClientPassword, setShowClientPassword] = useState(false)
  const [showClientConfirm, setShowClientConfirm] = useState(false)
  const router = useRouter()

  const [vendorForm, setVendorForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    country: "ZA",
    currency: "ZAR",
  })

  const [clientForm, setClientForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    company: "",
    phone: "",
  })

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (vendorForm.password !== vendorForm.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (vendorForm.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const result = await signUpVendor({
        email: vendorForm.email,
        password: vendorForm.password,
        name: vendorForm.name,
        phone: vendorForm.phone,
        country: vendorForm.country,
        currency: vendorForm.currency,
      })

      if (result.error) {
        setError(result.error)
      } else {
        alert("Vendor account created successfully! Please check your email to verify your account.")
        router.push("/login")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (clientForm.password !== clientForm.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (clientForm.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const result = await signUpClient({
        email: clientForm.email,
        password: clientForm.password,
        name: clientForm.name,
        company: clientForm.company,
        phone: clientForm.phone,
      })

      if (result.error) {
        setError(result.error)
      } else {
        alert("Client account created successfully! Please check your email to verify your account.")
        router.push("/login")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Receipt className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">QOMMERCE</h1>
          </div>
          <p className="text-balance text-muted-foreground">Professional invoice generation with QR code payments</p>
        </div>

        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Choose your account type and enter your details</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={userType} onValueChange={(v) => setUserType(v as "vendor" | "client")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="vendor">Vendor</TabsTrigger>
                <TabsTrigger value="client">Client</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="vendor">
                <form onSubmit={handleVendorSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor-name">Business Name *</Label>
                    <Input
                      id="vendor-name"
                      type="text"
                      placeholder="Your Business Name"
                      value={vendorForm.name}
                      onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor-email">Email *</Label>
                    <Input
                      id="vendor-email"
                      type="email"
                      placeholder="business@company.com"
                      value={vendorForm.email}
                      onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor-phone">Phone</Label>
                    <Input
                      id="vendor-phone"
                      type="tel"
                      placeholder="+27 12 345 6789"
                      value={vendorForm.phone}
                      onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="vendor-country">Country</Label>
                      <Input
                        id="vendor-country"
                        type="text"
                        placeholder="ZA"
                        value={vendorForm.country}
                        onChange={(e) => setVendorForm({ ...vendorForm, country: e.target.value })}
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vendor-currency">Currency</Label>
                      <Input
                        id="vendor-currency"
                        type="text"
                        placeholder="ZAR"
                        value={vendorForm.currency}
                        onChange={(e) => setVendorForm({ ...vendorForm, currency: e.target.value })}
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor-password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="vendor-password"
                        type={showVendorPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={vendorForm.password}
                        onChange={(e) => setVendorForm({ ...vendorForm, password: e.target.value })}
                        required
                        disabled={isLoading}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowVendorPassword(!showVendorPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                      >
                        {showVendorPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor-confirm">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="vendor-confirm"
                        type={showVendorConfirm ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={vendorForm.confirmPassword}
                        onChange={(e) => setVendorForm({ ...vendorForm, confirmPassword: e.target.value })}
                        required
                        disabled={isLoading}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowVendorConfirm(!showVendorConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                      >
                        {showVendorConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign up as Vendor"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="client">
                <form onSubmit={handleClientSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Full Name *</Label>
                    <Input
                      id="client-name"
                      type="text"
                      placeholder="John Doe"
                      value={clientForm.name}
                      onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email *</Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="name@company.com"
                      value={clientForm.email}
                      onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                      required
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-company">Company</Label>
                    <Input
                      id="client-company"
                      type="text"
                      placeholder="Company Name"
                      value={clientForm.company}
                      onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-phone">Phone</Label>
                    <Input
                      id="client-phone"
                      type="tel"
                      placeholder="+27 12 345 6789"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                      disabled={isLoading}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="client-password"
                        type={showClientPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        value={clientForm.password}
                        onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })}
                        required
                        disabled={isLoading}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClientPassword(!showClientPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                      >
                        {showClientPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-confirm">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="client-confirm"
                        type={showClientConfirm ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={clientForm.confirmPassword}
                        onChange={(e) => setClientForm({ ...clientForm, confirmPassword: e.target.value })}
                        required
                        disabled={isLoading}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClientConfirm(!showClientConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                      >
                        {showClientConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Sign up as Client"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
