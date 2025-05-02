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

    // Log the configuration (without sensitive data)
    console.log("SMS Configuration:", {
      accountSidExists: !!accountSid,
      authTokenExists: !!authToken,
      fromNumber: fromNumber || "Not configured",
    })

    // Format the phone number to E.164 format if it's not already
    let formattedPhoneNumber = options.to

    // Remove any non-digit characters for processing
    const digitsOnly = formattedPhoneNumber.replace(/\D/g, "")
    
    // If the phone number doesn't start with +, format it properly
    if (!formattedPhoneNumber.startsWith("+")) {
      // For Indian numbers (10 digits), add +91 prefix
      // Indian mobile numbers typically start with 6, 7, 8, or 9 and are 10 digits
      if (digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly)) {
        formattedPhoneNumber = "+91" + digitsOnly
      }
      // For US/Canada numbers with country code (11 digits starting with 1)
      else if (digitsOnly.startsWith("1") && digitsOnly.length === 11) {
        formattedPhoneNumber = "+" + digitsOnly
      }
      // For other cases, assume it's an Indian number if it's 10 digits
      else if (digitsOnly.length === 10) {
        formattedPhoneNumber = "+91" + digitsOnly
      }
      // Default case - just add + (this is a fallback)
      else {
        formattedPhoneNumber = "+" + digitsOnly
      }
    } else {
      // If it already has a +, make sure the number is clean
      formattedPhoneNumber = "+" + digitsOnly
    }


    // Check if Twilio is properly configured
    const isTwilioConfigured = !!(accountSid && authToken && fromNumber)
    
    if (!isTwilioConfigured) {
      console.log("Twilio configuration is missing - returning mock response")
      
      // For development/testing, log what would have been sent
      console.log("SMS would be sent to:", formattedPhoneNumber)
      console.log("SMS content:", options.body)

      // Return a mock successful response for development
      return {
        sid: "MOCK_SID_" + Date.now(),
        status: "sent",
        to: formattedPhoneNumber,
        body: options.body,
      }
    }

    // Create a Twilio client
    const client = new Twilio(accountSid, authToken)

    // Send the SMS
    const message = await client.messages.create({
      body: options.body,
      from: fromNumber,
      to: formattedPhoneNumber,
    })

    console.log("SMS sent successfully:", message.sid)
    return message
  } catch (error) {
    console.error("SMS sending error:", error)

    // Provide more detailed error information
    const errorMessage = error instanceof Error ? `SMS Error: ${error.message}` : "Unknown SMS error"

    throw new Error(errorMessage)
  }
}

// Helper function to check if Twilio is configured
export function isTwilioConfigured() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
  
  return !!(accountSid && authToken && fromNumber)
}