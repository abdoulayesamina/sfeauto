import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/logger";

// GET /api/client/vehicles - Get all vehicles for the logged-in client's company
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Only clients can use this endpoint
    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    // Get client ID from session
    const clientId = session.user.clientId;

    if (!clientId) {
      return NextResponse.json(
        { error: "Utilisateur non associé à une entreprise" },
        { status: 400 }
      );
    }

    // Fetch all vehicles for this client
    const vehicles = await prisma.vehicle.findMany({
      where: {
        clientId: clientId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        base: {
          select: {
            id: true,
            location: true,
            clientId: true,
          },
        },
        invoices: {
          select: {
            id: true,
            status: true,
            invoiceConfirmed: true,
            workDescription: true,
            accordNumber: true,
            dateOfConfirmation: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats
    const stats = {
      total: vehicles.length,
      inProgress: 0,
      completed: 0,
      noIntervention: 0,
    };

    vehicles.forEach((vehicle) => {
      if (vehicle.invoices.length === 0) {
        stats.noIntervention++;
      } else {
        const hasInProgress = vehicle.invoices.some(
          (i) => i.status !== "FIXING_FINISHED"
        );
        if (hasInProgress) {
          stats.inProgress++;
        } else {
          stats.completed++;
        }
      }
    });

    // Serialize dates
    const serializedVehicles = vehicles.map((v) => ({
      ...v,
      entryDate: v.entryDate.toISOString(),
      exitDate: v.exitDate?.toISOString() ?? null,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
      invoices: v.invoices.map((inv) => ({
        ...inv,
        createdAt: inv.createdAt.toISOString(),
        dateOfConfirmation: inv.dateOfConfirmation?.toISOString() ?? null,
      })),
    }));

    // Get bases for this client (for filter dropdown)
    const bases = await prisma.base.findMany({
      where: {
        clientId: clientId,
      },
      select: {
        id: true,
        location: true,
        clientId: true,
      },
      orderBy: {
        location: "asc",
      },
    });

    return NextResponse.json({
      vehicles: serializedVehicles,
      bases,
      stats,
    });
  } catch (error) {
    logError("Failed to fetch client vehicles", error);
    return NextResponse.json(
      { error: "Échec de la récupération des véhicules" },
      { status: 500 }
    );
  }
}
