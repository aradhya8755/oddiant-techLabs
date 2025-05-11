import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { sendEmail } from "@/lib/email"
import { generateNewsletterExcel } from "@/lib/newsletter"

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json()
    const { email } = body

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    // Connect to database
    const { db } = await connectToDatabase()

    // Check if email already exists
    const existingSubscriber = await db.collection("newsletters").findOne({ email })

    if (existingSubscriber) {
      // If already subscribed and active, return success
      if (existingSubscriber.active) {
        return NextResponse.json({ message: "You are already subscribed to our newsletter" }, { status: 200 })
      }

      // If unsubscribed before, reactivate
      await db.collection("newsletters").updateOne(
        { email },
        {
          $set: {
            active: true,
            subscriptionDate: new Date(),
            updatedAt: new Date(),
          },
          $unset: { unsubscribedDate: "" },
        },
      )
    } else {
      // Create new subscriber
      const now = new Date()
      await db.collection("newsletters").insertOne({
        email,
        subscriptionDate: now,
        active: true,
        source: "Website Footer",
        createdAt: now,
        updatedAt: now,
      })
    }

    // Generate Excel file with all subscribers
    const excelBuffer = await generateNewsletterExcel()

    // Send email notification with Excel attachment
    await sendEmail({
      subject: "New Newsletter Subscription",
      text: `A new user has subscribed to the newsletter: ${email}`,
      html: `
        <h2>New Newsletter Subscription</h2>
        <p>A new user has subscribed to your newsletter.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p>Please find attached the updated list of all subscribers.</p>
      `,
      attachments: [
        {
          filename: "newsletter_subscribers.xlsx",
          content: excelBuffer,
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    })

    return NextResponse.json({ message: "Successfully subscribed to newsletter" }, { status: 201 })
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json({ message: "An error occurred while processing your subscription" }, { status: 500 })
  }
}
