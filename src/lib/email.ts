import nodemailer from "nodemailer"

interface EmailOptions {
  to?: string
  subject: string
  text: string
  html?: string
  attachments?: Array<{
    filename: string
    content: any
  }>
}

export async function sendEmail(options: EmailOptions) {
  // Get email configuration from environment variables
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS
  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com"
  const emailPort = Number.parseInt(process.env.EMAIL_PORT || "587", 10)
  const emailTo = options.to || process.env.EMAIL_TO || emailUser

  if (!emailUser || !emailPass) {
    throw new Error("Email configuration is missing. Please check your environment variables.")
  }

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  })

  // Send the email
  const info = await transporter.sendMail({
    from: `"Oddiant Techlabs" <${emailUser}>`,
    to: emailTo,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  })

  return info
}
