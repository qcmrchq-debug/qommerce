const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

export async function sendEmail({
  to,
  subject,
  htmlContent,
}: {
  to: string
  subject: string
  htmlContent: string
}) {
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: {
        name: 'Qommerce',
        email: process.env.BREVO_FROM_EMAIL,
      },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Brevo error: ${error}`)
  }

  return response.json()
}
