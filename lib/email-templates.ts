function wrapHtml(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: Arial, sans-serif; color: #1f2937;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding: 24px 0;">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);">
            <tr>
              <td style="padding: 24px; text-align: center; background: #111827; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; letter-spacing: 0.02em;">Qommerce</h1>
                <p style="margin: 8px 0 0; font-size: 14px; color: #d1d5db;">Simple invoice payments for your customers</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 24px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="background: #f9fafb; padding: 20px 24px; font-size: 13px; color: #6b7280;">
                <p style="margin: 0;">This email was sent by Qommerce on behalf of <strong>${title}</strong>.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function formatCurrency(amount: number, currency: string) {
  return `${currency} ${amount.toFixed(2)}`
}

export function invoiceCreatedTemplate({
  customerName,
  vendorName,
  invoiceNumber,
  amount,
  currency,
  dueDate,
  paymentLink,
}: {
  customerName: string
  vendorName: string
  invoiceNumber: string
  amount: number
  currency: string
  dueDate: string
  paymentLink: string
}) {
  const body = `
    <h2 style="margin-top: 0; font-size: 20px; color: #111827;">New invoice ready for payment</h2>
    <p style="font-size: 16px; line-height: 1.6;">Hi ${customerName},</p>
    <p style="font-size: 16px; line-height: 1.6;">${vendorName} has created an invoice for you. Review the details below and complete your payment before the due date.</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 24px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 12px; background: #f3f4f6; border: 1px solid #e5e7eb;">Invoice number</td>
        <td style="padding: 12px; background: #ffffff; border: 1px solid #e5e7eb;">${invoiceNumber}</td>
      </tr>
      <tr>
        <td style="padding: 12px; background: #f3f4f6; border: 1px solid #e5e7eb;">Amount due</td>
        <td style="padding: 12px; background: #ffffff; border: 1px solid #e5e7eb;">${formatCurrency(amount, currency)}</td>
      </tr>
      <tr>
        <td style="padding: 12px; background: #f3f4f6; border: 1px solid #e5e7eb;">Due date</td>
        <td style="padding: 12px; background: #ffffff; border: 1px solid #e5e7eb;">${dueDate}</td>
      </tr>
    </table>
    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">Click the button below to view your invoice and pay securely.</p>
    <p style="text-align: center; margin: 0 0 32px;">
      <a href="${paymentLink}" style="display: inline-block; padding: 14px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Pay Invoice</a>
    </p>
    <p style="margin: 0; font-size: 14px; color: #6b7280;">If you have questions, reply to this email and ${vendorName} will help.</p>
  `
  return wrapHtml(vendorName, body)
}

export function dueDateReminderTemplate({
  customerName,
  vendorName,
  invoiceNumber,
  amount,
  currency,
  dueDate,
  paymentLink,
}: {
  customerName: string
  vendorName: string
  invoiceNumber: string
  amount: number
  currency: string
  dueDate: string
  paymentLink: string
}) {
  const body = `
    <h2 style="margin-top: 0; font-size: 20px; color: #111827;">Payment reminder</h2>
    <p style="font-size: 16px; line-height: 1.6;">Hi ${customerName},</p>
    <p style="font-size: 16px; line-height: 1.6;">This is a friendly reminder that your invoice is due today. Please complete the payment to avoid any delays.</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 24px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 12px; background: #f3f4f6; border: 1px solid #e5e7eb;">Invoice number</td>
        <td style="padding: 12px; background: #ffffff; border: 1px solid #e5e7eb;">${invoiceNumber}</td>
      </tr>
      <tr>
        <td style="padding: 12px; background: #f3f4f6; border: 1px solid #e5e7eb;">Amount due</td>
        <td style="padding: 12px; background: #ffffff; border: 1px solid #e5e7eb;">${formatCurrency(amount, currency)}</td>
      </tr>
      <tr>
        <td style="padding: 12px; background: #f3f4f6; border: 1px solid #e5e7eb;">Due date</td>
        <td style="padding: 12px; background: #ffffff; border: 1px solid #e5e7eb;">${dueDate}</td>
      </tr>
    </table>
    <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6;">Please use the link below to pay your invoice now.</p>
    <p style="text-align: center; margin: 0 0 32px;">
      <a href="${paymentLink}" style="display: inline-block; padding: 14px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">Pay Now</a>
    </p>
    <p style="margin: 0; font-size: 14px; color: #6b7280;">If you need assistance, reply to this email and ${vendorName} will be in touch.</p>
  `
  return wrapHtml(vendorName, body)
}

export function paymentConfirmedTemplate({
  customerName,
  vendorName,
  invoiceNumber,
  amount,
  currency,
}: {
  customerName: string
  vendorName: string
  invoiceNumber: string
  amount: number
  currency: string
}) {
  const body = `
    <h2 style="margin-top: 0; font-size: 20px; color: #111827;">Payment confirmed</h2>
    <p style="font-size: 16px; line-height: 1.6;">Hi ${customerName},</p>
    <p style="font-size: 16px; line-height: 1.6;">Thanks for completing your payment. We have received the funds and your invoice is now marked as paid.</p>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 24px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 12px; background: #f3f4f6; border: 1px solid #e5e7eb;">Invoice number</td>
        <td style="padding: 12px; background: #ffffff; border: 1px solid #e5e7eb;">${invoiceNumber}</td>
      </tr>
      <tr>
        <td style="padding: 12px; background: #f3f4f6; border: 1px solid #e5e7eb;">Amount paid</td>
        <td style="padding: 12px; background: #ffffff; border: 1px solid #e5e7eb;">${formatCurrency(amount, currency)}</td>
      </tr>
    </table>
    <p style="margin: 0; font-size: 14px; color: #6b7280;">If you have questions about this payment, reply to this email and ${vendorName} will help.</p>
  `
  return wrapHtml(vendorName, body)
}
