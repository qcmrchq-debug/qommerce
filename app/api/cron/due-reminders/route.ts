import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dueDateReminderTemplate } from '@/lib/email-templates'
import { sendEmail } from '@/lib/email'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const supabase = await createClient()

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, customer_name, customer_email, total_amount, currency, due_date, vendors!inner(name)')
    .in('invoices_status', ['pending', 'sent'])
    .gte('due_date', today)
    .lt('due_date', tomorrow)

  if (error) {
    console.error('Due reminder cron: failed to query invoices', error)
    return NextResponse.json({ error: 'Failed to query invoices' }, { status: 500 })
  }

  let sentCount = 0

  if (Array.isArray(invoices)) {
    for (const invoice of invoices) {
      try {
        const paymentLink = `${appUrl}/login?redirect=/client/pay/${invoice.id}`
        const htmlContent = dueDateReminderTemplate({
          customerName: invoice.customer_name,
          vendorName: invoice.vendors.name,
          invoiceNumber: invoice.invoice_number,
          amount: invoice.total_amount,
          currency: invoice.currency,
          dueDate: invoice.due_date ?? today,
          paymentLink,
        })

        await sendEmail({
          to: invoice.customer_email,
          subject: `Reminder: invoice ${invoice.invoice_number} is due today`,
          htmlContent,
        })

        sentCount += 1
      } catch (err) {
        console.error(`Due reminder cron: failed to send reminder for invoice ${invoice.id}`, err)
      }
    }
  }

  return NextResponse.json({ sent: sentCount })
}
