import jsPDF from 'jspdf'

export function generateInvoicePDF(invoice: any) {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.text('INVOICE', 20, 30)

  doc.setFontSize(12)
  doc.text(`Invoice Number: ${invoice.invoice_number}`, 20, 50)
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 60)
  if (invoice.due_date) {
    doc.text(`Due Date: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 70)
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

  if (invoice.items) {
    invoice.items.forEach((item: any) => {
      doc.text(item.name || '', 20, y)
      doc.text(item.quantity?.toString() || '1', 120, y)
      doc.text(`R${item.price?.toFixed(2) || '0.00'}`, 150, y)
      doc.text(`R${((item.quantity || 1) * (item.price || 0)).toFixed(2)}`, 180, y)
      y += 10
    })
  }

  y += 10
  doc.line(20, y, 190, y)
  y += 10

  // Totals
  doc.text(`Subtotal: R${invoice.subtotal?.toFixed(2) || '0.00'}`, 150, y)
  y += 10
  doc.text(`Tax: R${invoice.tax_amount?.toFixed(2) || '0.00'}`, 150, y)
  y += 10
  doc.setFontSize(14)
  doc.text(`Total: R${invoice.total_amount?.toFixed(2) || '0.00'}`, 150, y + 10)

  // Save the PDF
  doc.save(`invoice-${invoice.invoice_number}.pdf`)
}