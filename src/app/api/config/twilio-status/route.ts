import { NextResponse } from "next/server"

export async function GET() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER
  
  const configured = !!(accountSid && authToken && fromNumber)
  
  return NextResponse.json({
    configured,
    // Only include this in development mode
    ...(process.env.NODE_ENV === "development" && {
      details: {
        accountSidExists: !!accountSid,
        authTokenExists: !!authToken,
        fromNumberExists: !!fromNumber
      }
    })
  })
}