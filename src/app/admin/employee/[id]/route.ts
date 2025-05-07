import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    const employeeId = segments[segments.length - 1];

    if (!employeeId || !ObjectId.isValid(employeeId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing employee ID" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const employee = await db.collection("employees").findOne({
      _id: new ObjectId(employeeId),
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found" },
        { status: 404 }
      );
    }

    const { password, ...employeeData } = employee;

    const response = NextResponse.json(
      { success: true, employee: employeeData },
      { status: 200 }
    );

    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error in GET /api/employee/[id]:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
