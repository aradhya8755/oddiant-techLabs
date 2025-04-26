import { type NextRequest, NextResponse } from "next/server";
import { cookies as getCookies } from "next/headers"; // renamed to avoid confusion
import { sign, verify } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = "1d";

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password with hash
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(userId: string): string {
  return sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
}

// Verify JWT token
export function verifyToken(token: string): { userId: string } | null {
  try {
    return verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

// Set JWT token in cookies
export async function setAuthCookie(token: string, response: NextResponse): Promise<void> {
  const cookieStore = await getCookies(); // await cookies()
  cookieStore.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24, // 1 day
    path: "/",
    sameSite: "lax",
  });
}

// Clear auth cookie
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await getCookies();
  cookieStore.delete("auth_token");
}

// Get user ID from request
export async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    return null;
  }
  const decoded = verifyToken(token);
  return decoded?.userId || null;
}

// Auth middleware
export async function authMiddleware(req: NextRequest): Promise<NextResponse | null> {
  const userId = await getUserFromRequest(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// Get user by ID
export async function getUserById(userId: string) {
  try {
    const { db } = await connectToDatabase();
    const user = await db.collection("students").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return null;
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

// Generate OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
