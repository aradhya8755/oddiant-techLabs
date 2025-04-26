import { type NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { generateToken, setAuthCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, userType = "student" } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    if (email === process.env.EMAIL_TO) {
      let admin = await db.collection("admins").findOne({ email });

      if (!admin) {
        const hashedPassword = await bcrypt.hash("Hridesh123!", 10);
        const result = await db.collection("admins").insertOne({
          email,
          password: hashedPassword,
          role: "admin",
          name: "Admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        admin = await db.collection("admins").findOne({ _id: result.insertedId });
      }

      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
      }

      const token = generateToken(admin._id.toString());
      const response = NextResponse.json({ success: true, role: "admin" }, { status: 200 });
      await setAuthCookie(token, response); // await here
      return response;
    }

    const collection = userType === "employee" ? "employees" : "students";
    const user = await db.collection(collection).findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    if (userType === "employee" && !user.verified) {
      if (user.rejected) {
        return NextResponse.json({
          success: false,
          message: "Your account has been rejected. Please check your email for details or appeal the decision.",
          rejected: true,
          employeeId: user._id.toString(),
        }, { status: 403 });
      }

      if (user.emailVerified) {
        return NextResponse.json({
          success: false,
          message: "Your account is pending approval. You will receive an email once approved.",
          pendingApproval: true,
        }, { status: 403 });
      }

      return NextResponse.json({
        success: false,
        message: "Please verify your email before logging in.",
        unverified: true,
        email: user.email,
      }, { status: 403 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }

    const token = generateToken(user._id.toString());
    const response = NextResponse.json({ success: true, role: userType }, { status: 200 });
    await setAuthCookie(token, response); // await here
    return response;
  } catch (error) {
    console.error("Error in login:", error);
    return NextResponse.json({ success: false, message: "Login failed. Please try again." }, { status: 500 });
  }
}
