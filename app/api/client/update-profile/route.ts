import { NextResponse } from "next/server"
import { updateClientProfile } from "@/app/actions/clients"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, company, phone } = body
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const client = await updateClientProfile({ name, company, phone })
    return NextResponse.json({ success: true, client })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
