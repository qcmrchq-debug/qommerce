import { getClientContext } from "@/app/actions/clients"
import ClientSettingsClient from "./ClientSettingsClient"

export default async function ClientSettingsPage() {
  const ctx = await getClientContext()
  const client = ctx.client

  return (
    <div>
      <ClientSettingsClient initialClient={client} />
    </div>
  )
}
