import { Twilio } from "twilio"

interface SMSOptions {
  to: string
  body: string
}

export async function sendSMS(options: SMSOptions) {
  try {
    // Get Twilio configuration from environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      console.error("Twilio configuration is missing!")
      throw new Error("Twilio configuration is missing. Please check your environment variables.")
    }

    // Create a Twilio client
    const client = new Twilio(accountSid, authToken)

    // Send the SMS
    const message = await client.messages.create({
      body: options.body,
      from: fromNumber,
      to: options.to,
    })

    console.log("SMS sent successfully:", message.sid)
    return message
  } catch (error) {
    console.error("SMS sending error:", error)
    throw error
  }
}
