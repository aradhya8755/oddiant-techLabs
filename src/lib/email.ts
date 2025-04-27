import nodemailer from "nodemailer"

interface EmailOptions {
  to?: string
  subject: string
  text: string
  html?: string
  attachments?: Array<{
    filename: string
    content: any
    contentType?: string
  }>
}

export async function sendEmail(options: EmailOptions) {
  try {
    // Get email configuration from environment variables
    const emailUser = process.env.EMAIL_USER
    const emailPass = process.env.EMAIL_PASS
    const emailHost = process.env.EMAIL_HOST
    const emailPort = Number.parseInt(process.env.EMAIL_PORT || "587", 10)
    const emailTo = options.to || process.env.EMAIL_TO || emailUser

    if (!emailUser || !emailPass) {
      console.error("Email configuration is missing!")
      throw new Error("Email configuration is missing. Please check your environment variables.")
    }

    console.log(`Configuring email transporter with host: ${emailHost}, port: ${emailPort}`)

    // Create a transporter with improved timeout settings
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 15000, // 15 seconds
    })

    console.log("Sending email to:", emailTo)

    // Ensure attachments have proper content type
    const processedAttachments = options.attachments?.map((attachment) => {
      if (attachment.filename.endsWith(".xlsx") && !attachment.contentType) {
        return {
          ...attachment,
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      }
      return attachment
    })

    // Send the email
    const info = await transporter.sendMail({
      from: `"Oddiant Techlabs" <${emailUser}>`,
      to: emailTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: processedAttachments,
    })

    console.log("Email sent successfully:", info.messageId)
    return info
  } catch (error) {
    console.error("Email sending error:", error)
    throw error
  }
}
