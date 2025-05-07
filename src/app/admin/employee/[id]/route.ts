import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const employeeId = params.id;

    if (!employeeId) {
      return NextResponse.json(
        { success: false, message: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Find employee by ID
    let employee;
    try {
      employee = await db.collection("employees").findOne({
        _id: new ObjectId(employeeId),
      });
    } catch (error) {
      console.error("Error finding employee by ID:", error);
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

    // Remove sensitive information
    const { password, ...employeeData } = employee;

    // Create response
    const response = NextResponse.json(
      { success: true, employee: employeeData },
      { status: 200 }
    );

    // Set cache control headers
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch employee" },
      { status: 500 }
    );
  }
}