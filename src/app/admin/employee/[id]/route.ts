import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing ID" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const appeal = await db.collection("appeals").findOne({
      _id: new ObjectId(id),
    });

    if (!appeal) {
      return NextResponse.json(
        { success: false, message: "Appeal not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json(
      { success: true, appeal },
      { status: 200 }
    );

    // Optional: Prevent caching
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error in GET /api/employee/appeal/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
