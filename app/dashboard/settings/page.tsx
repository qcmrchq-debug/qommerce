import { getVendorProfile } from "@/app/actions/vendors"
import SettingsClient from "./SettingsClient"

export default async function SettingsPage() {
  const profile = await getVendorProfile()

  return <SettingsClient initialProfile={profile} />
}
