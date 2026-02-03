import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

// Helpers
function parseOptionalInt(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalDate(value: unknown): Date | null {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

function normalizeOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

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

        firstRegistrationDate: true,
        energy: true,
        doorsCount: true,
        bodyType: true,
        realPowerHp: true,
        fiscalPowerCv: true,
        gearboxType: true,
        version: true,
        registrationCardDate: true,

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
            photos: {
              select: {
                id: true,
                url: true,
              },
            },

            handledBy: { select: { name: true, email: true } },
            devis: {
              where: { dev_supprimee: false },
              select: { dev_id: true, dev_numdevis: true },


            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: search ? 10 : 100,
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

    const {
      licensePlate,
      model,
      brand,
      year,
      color,
      clientId,
      baseId,
      entryDate,
      exitDate,

      firstRegistrationDate,
      energy,
      doorsCount,
      bodyType,
      realPowerHp,
      fiscalPowerCv,
      gearboxType,
      version,
      registrationCardDate,
    } = body;

    if (!String(licensePlate ?? "").trim() || !String(clientId ?? "").trim() || !String(baseId ?? "").trim()) {
      return NextResponse.json(
        { error: "Immatriculation, client et agence requis" },
        { status: 400 }
      );
    }

    if (year !== undefined && year !== null && year !== "") {
      const parsedYear = parseOptionalInt(year);
      if (!parsedYear || parsedYear < 1900 || parsedYear > 2100) {
        return NextResponse.json(
          { error: "L'année doit être un nombre valide entre 1900 et 2100" },
          { status: 400 }
        );
      }
    }

    const base = await prisma.base.findUnique({
      where: { id: String(baseId) },
      select: { id: true, clientId: true },
    });

    if (!base) {
      return NextResponse.json({ error: "Agence invalide" }, { status: 400 });
    }
    if (base.clientId !== String(clientId)) {
      return NextResponse.json(
        { error: "Cette agence n'appartient pas au client sélectionné" },
        { status: 400 }
      );
    }

    const parsedYear = parseOptionalInt(year);
    const parsedDoorsCount = parseOptionalInt(doorsCount);
    const parsedRealPowerHp = parseOptionalInt(realPowerHp);
    const parsedFiscalPowerCv = parseOptionalInt(fiscalPowerCv);

    const parsedFirstReg = parseOptionalDate(firstRegistrationDate);
    const parsedRegistrationCard = parseOptionalDate(registrationCardDate);

    if (firstRegistrationDate && !parsedFirstReg) {
      return NextResponse.json(
        { error: "firstRegistrationDate invalide (format date attendu)" },
        { status: 400 }
      );
    }

    if (registrationCardDate && !parsedRegistrationCard) {
      return NextResponse.json(
        { error: "registrationCardDate invalide (format date attendu)" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        licensePlate: String(licensePlate).trim(),
        model: normalizeOptionalString(model),
        brand: normalizeOptionalString(brand),
        year: parsedYear,
        color: normalizeOptionalString(color),

        firstRegistrationDate: parsedFirstReg,
        energy: energy ?? null,
        doorsCount: parsedDoorsCount,
        bodyType: bodyType ?? null,
        realPowerHp: parsedRealPowerHp,
        fiscalPowerCv: parsedFiscalPowerCv,
        gearboxType: gearboxType ?? null,
        version: normalizeOptionalString(version),
        registrationCardDate: parsedRegistrationCard,

        clientId: String(clientId),
        baseId: String(baseId),

        entryDate: entryDate ? new Date(entryDate) : new Date(),
        exitDate: exitDate ? new Date(exitDate) : null,

        handledById: session.user.id,
      },
      include: {
        client: true,
        base: { select: { id: true, location: true } },
        handledBy: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
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
