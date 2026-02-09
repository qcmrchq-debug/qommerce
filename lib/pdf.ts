import jsPDF from 'jspdf'
import type { Invoice, Receipt } from './types'

export function generateInvoicePDF(invoice: Invoice) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text('INVOICE', 20, 30)

  doc.setFontSize(12)
  doc.text(`Invoice Number: ${invoice.invoice_number}`, 20, 50)
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`, 20, 60)
  if (invoice.due_date) {
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`, 20, 70)
  }

  // Customer info
  doc.text('Bill To:', 20, 90)
  doc.text(invoice.customer_name, 20, 100)
  doc.text(invoice.customer_email, 20, 110)
  if (invoice.customer_phone) {
    doc.text(invoice.customer_phone, 20, 120)
  }

  // Items table
  let y = 140
  doc.text('Description', 20, y)
  doc.text('Qty', 120, y)
  doc.text('Price', 150, y)
  doc.text('Total', 180, y)

  y += 10
  doc.line(20, y, 190, y)
  y += 10

  const currencySymbol = 'R'
  
  if (invoice.items) {
    invoice.items.forEach((item) => {
      doc.text(item.name || '', 20, y)
      doc.text(item.quantity?.toString() || '1', 120, y)
      doc.text(`${currencySymbol}${item.price?.toFixed(2) || '0.00'}`, 150, y)
      doc.text(`${currencySymbol}${((item.quantity || 1) * (item.price || 0)).toFixed(2)}`, 180, y)
      y += 10
    })
  }

  y += 10
  doc.line(20, y, 190, y)
  y += 10

  // Totals
  doc.text(`Subtotal: ${currencySymbol}${invoice.subtotal?.toFixed(2) || '0.00'}`, 150, y)
  y += 10
  doc.text(`Tax: ${currencySymbol}${invoice.tax_amount?.toFixed(2) || '0.00'}`, 150, y)
  y += 10
  doc.setFontSize(14)
  doc.text(`Total: ${currencySymbol}${invoice.total_amount?.toFixed(2) || '0.00'}`, 150, y + 10)

  // Save the PDF
  doc.save(`invoice-${invoice.invoice_number}.pdf`)
}

export function generateReceiptPDF(receipt: Receipt) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text('RECEIPT', 20, 30)

  doc.setFontSize(12)
  doc.text(`Receipt Number: ${receipt.receipt_number}`, 20, 50)
  doc.text(`Date: ${new Date(receipt.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`, 20, 60)
  doc.text(`Payment Date: ${new Date(receipt.payment_date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`, 20, 70)
  if (receipt.payment_method) {
    doc.text(`Payment Method: ${receipt.payment_method}`, 20, 80)
  }

  // Customer info
  doc.text('Received From:', 20, 100)
  doc.text(receipt.customer_name, 20, 110)
  doc.text(receipt.customer_email, 20, 120)
  if (receipt.customer_phone) {
    doc.text(receipt.customer_phone, 20, 130)
  }

  // Items table
  let y = 150
  doc.text('Description', 20, y)
  doc.text('Qty', 120, y)
  doc.text('Price', 150, y)
  doc.text('Total', 180, y)

  y += 10
  doc.line(20, y, 190, y)
  y += 10

  const currencySymbol = 'R'
  
  if (receipt.items) {
    receipt.items.forEach((item) => {
      doc.text(item.name || '', 20, y)
      doc.text(item.quantity?.toString() || '1', 120, y)
      doc.text(`${currencySymbol}${item.price?.toFixed(2) || '0.00'}`, 150, y)
      doc.text(`${currencySymbol}${((item.quantity || 1) * (item.price || 0)).toFixed(2)}`, 180, y)
      y += 10
    })
  }

  y += 10
  doc.line(20, y, 190, y)
  y += 10

  // Totals
  doc.text(`Subtotal: ${currencySymbol}${receipt.subtotal?.toFixed(2) || '0.00'}`, 150, y)
  y += 10
  doc.text(`Tax: ${currencySymbol}${receipt.tax_amount?.toFixed(2) || '0.00'}`, 150, y)
  y += 10
  doc.setFontSize(14)
  doc.text(`Total: ${currencySymbol}${receipt.total_amount?.toFixed(2) || '0.00'}`, 150, y + 10)
  y += 20
  doc.text(`Amount Paid: ${currencySymbol}${receipt.amount_paid?.toFixed(2) || '0.00'}`, 150, y)

  // PAID watermark
  doc.setFontSize(60)
  doc.setTextColor(200, 200, 200) // Light gray
  doc.text('PAID', 105, 150, { angle: 45 })

  // Reset text color
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)

  // Save the PDF
  doc.save(`receipt-${receipt.receipt_number}.pdf`)
}