import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

// GET /api/vehicles - List all vehicles or search by license plate
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const vehicles = await prisma.vehicle.findMany({
      where: search
        ? {
            licensePlate: {
              contains: search,
            },
          }
        : undefined,
      select: {
        id: true,
        licensePlate: true,
        brand: true,
        model: true,
        year: true,
        color: true,
        entryDate: true,
        exitDate: true,
        createdAt: true,
        updatedAt: true,
        client: { select: { id: true, name: true } },
        base: { select: { id: true, location: true, clientId: true } },
        invoices: {
          select: {
            id: true,
            invoiceConfirmed: true,
            status: true,
            accordNumber: true,
            dateOfConfirmation: true,
            statusUpdatedAt: true,
            workDescription: true,
            didOrderParts: true,
            ordersDetails: true,
            comments: true,
            createdAt: true,
            updatedAt: true,
            handledBy: { select: { name: true, email: true } }
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: search ? 10 : 100,  // Limit results
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    logError("Failed to fetch vehicles", error);
    return NextResponse.json(
      { error: "Échec de la récupération des véhicules" },
      { status: 500 }
    );
  }
}

// POST /api/vehicles - Create a new vehicle
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { licensePlate, model, brand, year, color, clientId, baseId, entryDate, exitDate } = body;

    // Validate required fields
    if (!licensePlate?.trim() || !clientId?.trim() || !baseId?.trim()) {
      return NextResponse.json(
        { error: "Immatriculation, client et agence requis" },
        { status: 400 }
      );
    }

    // Validate year if provided
    if (year) {
      const parsedYear = parseInt(year, 10);
      if (isNaN(parsedYear) || parsedYear < 1900 || parsedYear > 2100) {
        return NextResponse.json(
          { error: "L'année doit être un nombre valide entre 1900 et 2100" },
          { status: 400 }
        );
      }
    }

    // Validate base exists AND belongs to selected client (single query)
    const base = await prisma.base.findUnique({
      where: { id: baseId },
      include: { client: { select: { id: true } } }
    });
    if (!base) {
      return NextResponse.json(
        { error: "Agence invalide" },
        { status: 400 }
      );
    }
    if (base.clientId !== clientId) {
      return NextResponse.json(
        { error: "Cette agence n'appartient pas au client sélectionné" },
        { status: 400 }
      );
    }
    // Client validated via base.client relation

    // Create vehicle (duplicate licensePlate caught by P2002 below)
    const vehicle = await prisma.vehicle.create({
      data: {
        licensePlate,
        model,
        brand,
        year: year ? parseInt(year, 10) : null,
        color,
        clientId,
        baseId,
        entryDate: entryDate ? new Date(entryDate) : new Date(),
        exitDate: exitDate ? new Date(exitDate) : null,
        handledById: session.user.id,
      },
      include: {
        client: true,
        base: {
          select: {
            id: true,
            location: true,
          },
        },
        handledBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    // Handle unique constraint error (duplicate licensePlate)
    if (error.code === 'P2002') {
      logError("Failed to create vehicle - duplicate license plate", error);
      return NextResponse.json(
        { error: "Un véhicule avec cette immatriculation existe déjà" },
        { status: 409 }
      );
    }
    logError("Failed to create vehicle", error);
    return NextResponse.json(
      { error: "Échec de la création du véhicule" },
      { status: 500 }
    );
  }
}
