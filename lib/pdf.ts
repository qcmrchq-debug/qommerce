import jsPDF from 'jspdf'
import type { Invoice, Receipt } from './types'

export function generateInvoicePDF(invoice: Invoice) {
  const doc = new jsPDF()
  const currencySymbol = 'R'

  const vendorName = invoice.vendors?.name || 'Vendor'
  const vendorAddress = invoice.vendors?.address || ''
  const vendorPhone = invoice.vendors?.phone || ''
  const vendorEmail = invoice.vendors?.email || ''
  const vendorTaxNumber = invoice.vendors?.tax_number || ''

  // Header: vendor details left, invoice details right
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(vendorName, 20, 30)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  let vendorY = 38
  if (vendorAddress) {
    doc.text(vendorAddress, 20, vendorY)
    vendorY += 6
  }
  if (vendorPhone) {
    doc.text(`Phone: ${vendorPhone}`, 20, vendorY)
    vendorY += 6
  }
  if (vendorEmail) {
    doc.text(`Email: ${vendorEmail}`, 20, vendorY)
    vendorY += 6
  }
  if (vendorTaxNumber) {
    doc.text(`Tax Number: ${vendorTaxNumber}`, 20, vendorY)
    vendorY += 6
  }

  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 140, 30, { align: 'right' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice Number: ${invoice.invoice_number}`, 140, 40, { align: 'right' })
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 140, 46, { align: 'right' })
  if (invoice.due_date) {
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 140, 52, { align: 'right' })
  }

  // Bill To section
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO', 20, 76)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(invoice.customer_name || '', 20, 84)
  doc.text(invoice.customer_email || '', 20, 90)
  if (invoice.customer_phone) {
    doc.text(invoice.customer_phone, 20, 96)
  }

  // Items table header
  const tableTop = 110
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Description', 20, tableTop)
  doc.text('Qty', 110, tableTop)
  doc.text('Rate', 140, tableTop)
  doc.text('Amount', 170, tableTop)
  doc.line(20, tableTop + 2, 190, tableTop + 2)

  let y = tableTop + 10
  doc.setFont('helvetica', 'normal')
  const rowHeight = 8

  if (invoice.items) {
    invoice.items.forEach((item) => {
      doc.text(item.name || '', 20, y)
      doc.text((item.quantity || 1).toString(), 110, y)
      doc.text(`${currencySymbol}${(item.price || 0).toFixed(2)}`, 140, y)
      const amount = (item.quantity || 1) * (item.price || 0)
      doc.text(`${currencySymbol}${amount.toFixed(2)}`, 170, y)
      y += rowHeight
      if (y > 250) {
        doc.addPage()
        y = 20
      }
    })
  }

  // Summary block
  let summaryY = Math.max(y + 10, 170)
  doc.line(110, summaryY, 190, summaryY)
  summaryY += 8
  doc.setFontSize(10)
  doc.text('Subtotal', 130, summaryY)
  doc.text(`${currencySymbol}${(invoice.subtotal || 0).toFixed(2)}`, 170, summaryY, { align: 'right' })
  summaryY += 8
  doc.text('Tax', 130, summaryY)
  doc.text(`${currencySymbol}${(invoice.tax_amount || 0).toFixed(2)}`, 170, summaryY, { align: 'right' })
  summaryY += 10
  doc.setFont('helvetica', 'bold')
  doc.text('Total', 130, summaryY)
  doc.text(`${currencySymbol}${(invoice.total_amount || 0).toFixed(2)}`, 170, summaryY, { align: 'right' })

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