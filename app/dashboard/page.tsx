import { getDashboardStats } from "@/app/actions/dashboard"
import { getVendorId } from "@/app/actions/vendors"
import DashboardClient from "./DashboardClient"

export default async function DashboardPage() {
  const vendorId = await getVendorId()
  const stats = await getDashboardStats(vendorId)

  return <DashboardClient stats={stats} />
}
