'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail } from '@/lib/email'
import {
  invoiceCreatedTemplate,
  paymentConfirmedTemplate,
  dueDateReminderTemplate,
} from '@/lib/email-templates'

const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''

async function getInvoiceWithVendor(invoiceId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, total_amount, currency, due_date, customer_name, customer_email, vendors!inner(name)')
    .eq('id', Number(invoiceId))
    .single()

  if (error || !data) {
    if (error instanceof Error) {
      console.error('Failed to load invoice with vendor:', {
        message: error.message,
        stack: error.stack,
        invoiceId,
      })
    } else {
      console.error('Failed to load invoice with vendor:', { error, invoiceId })
    }
    throw new Error('Invoice not found')
  }

  return data as {
    id: number
    invoice_number: string
    total_amount: number
    currency: string
    due_date: string | null
    customer_name: string
    customer_email: string
    vendors: { name: string }
  }
}

export async function sendInvoiceCreatedEmail(invoiceId: string): Promise<void> {
  try {
    const invoice = await getInvoiceWithVendor(invoiceId)
    const paymentLink = `${appUrl}/login?redirect=/client/pay/${invoiceId}`
    const htmlContent = invoiceCreatedTemplate({
      customerName: invoice.customer_name,
      vendorName: invoice.vendors.name,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.total_amount,
      currency: invoice.currency,
      dueDate: invoice.due_date ?? 'No due date',
      paymentLink,
    })

    await sendEmail({
      to: invoice.customer_email,
      subject: `New invoice ${invoice.invoice_number} from ${invoice.vendors.name}`,
      htmlContent,
    })
  } catch (error) {
    console.error('Failed to send invoice created email:', error)
  }
}

export async function sendPaymentConfirmedEmail(invoiceId: string): Promise<void> {
  try {
    const invoice = await getInvoiceWithVendor(invoiceId)
    const htmlContent = paymentConfirmedTemplate({
      customerName: invoice.customer_name,
      vendorName: invoice.vendors.name,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.total_amount,
      currency: invoice.currency,
    })

    console.log('Sending payment confirmed email for invoice:', {
      invoiceId,
      invoice,
    })

    await sendEmail({
      to: invoice.customer_email,
      subject: `Payment confirmed for invoice ${invoice.invoice_number}`,
      htmlContent,
    })
  } catch (error) {
    console.error('Failed to send payment confirmed email:', error)
  }
}

export async function sendDueDateReminderEmail(invoiceId: string): Promise<void> {
  try {
    const invoice = await getInvoiceWithVendor(invoiceId)
    const paymentLink = `${appUrl}/login?redirect=/client/pay/${invoiceId}`
    const htmlContent = dueDateReminderTemplate({
      customerName: invoice.customer_name,
      vendorName: invoice.vendors.name,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.total_amount,
      currency: invoice.currency,
      dueDate: invoice.due_date ?? 'Due today',
      paymentLink,
    })

    await sendEmail({
      to: invoice.customer_email,
      subject: `Invoice ${invoice.invoice_number} due today`,
      htmlContent,
    })
  } catch (error) {
    console.error('Failed to send due date reminder email:', error)
  }
}
