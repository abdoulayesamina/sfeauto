import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/lib/logger";

// GET /api/bases - Get all bases or filter by client
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Allow both ADMIN and MANAGER to fetch bases
    if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const bases = await prisma.base.findMany({
      where: clientId ? { clientId } : undefined,
      include: {
        client: true,
      },
      orderBy: {
        location: "asc",
      },
    });

    return NextResponse.json(bases);
  } catch (error) {
    logError("Failed to fetch bases", error);
    return NextResponse.json(
      { error: "Failed to fetch bases" },
      { status: 500 }
    );
  }
}
