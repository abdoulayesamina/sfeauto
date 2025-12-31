import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/lib/logger";

// GET /api/clients - Get all clients
export async function GET() {
  try {
    const session = await auth();

    // Allow both ADMIN and MANAGER to fetch clients
    if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    logError("Failed to fetch clients", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
