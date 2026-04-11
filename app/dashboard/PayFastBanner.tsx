"use client"

import { useState } from "react"
import Link from "next/link"
import { X } from "lucide-react"

interface PayFastBannerProps {
  payfastConnected?: boolean | null
}

export default function PayFastBanner({ payfastConnected }: PayFastBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (payfastConnected || dismissed) {
    return null
  }

  return (
    <div className="flex flex-col gap-3 rounded-b-2xl border-b border-orange-400 bg-orange-100 px-4 py-4 text-orange-950 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="space-y-1">
        <p className="text-sm font-semibold">PayFast is not connected.</p>
        <p className="text-sm text-orange-950">
          Go to <Link href="/dashboard/settings" className="font-medium underline">Settings</Link> to connect your PayFast account and start accepting payments.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-orange-950 transition hover:bg-orange-200"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
