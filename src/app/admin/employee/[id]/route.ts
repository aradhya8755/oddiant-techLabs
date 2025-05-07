import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: employeeId } = params;

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: "Employee ID is required" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    let employee;
    try {
      employee = await db.collection("employees").findOne({
        _id: new ObjectId(employeeId),
      });
    } catch (error) {
      console.error("Error finding employee:", error);
      return NextResponse.json(
        { success: false, message: "Invalid employee ID format" },
        { status: 400 }
      );
    }

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

export const dynamic = "force-dynamic";