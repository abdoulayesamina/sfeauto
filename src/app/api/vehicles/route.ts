import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { tr } from "zod/v4/locales";

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

// GET /api/vehicles
// ============================
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["MANAGER", "AGENCE","MECHANIC","ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session.user.role === "AGENCE" && !session.user.baseId) {
      return NextResponse.json(
        { error: "Compte agence sans base associée" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const baseFilter =
      session.user.role === "AGENCE"
        ? { baseId: session.user.baseId ?? "" }
        : {};

    const vehicles = await prisma.vehicle.findMany({
      where: {
        ...baseFilter,
        ...(search
          ? {
              licensePlate: { contains: search },
            }
          : {}),
      },
      select: {
        id: true,
        licensePlate: true,
        brandId: true,
        modelId: true,
        
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

        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        
        model: {
          select: {
            id: true,
            name: true,
          },
        },

        invoices: {
          select: {
            id: true,
            vehicleId:true,
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
            photos: { select: { id: true, url: true } },
            handledBy: { select: { name: true, email: true } },
            devis: {
              where: { dev_supprimee: false },
              select: { dev_id: true, dev_numdevis: true },
            },
            vehicle:{
              select: {
                licensePlate: true,
                color: true,
                year: true,
                clientId: true,
                baseId: true,
                entryDate: true,
                brand:{
                  select: {name : true}
                },
                model:{
                  select: {name : true}
                },
                client:{
                  select: {name:true}
                },
                base:{
                  select: {location:true}
                }
              }
            }
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: search ? 10 : 100,
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    logError("Failed to fetch vehicles", error);
    return NextResponse.json(
      { error: "Échec de la récupération des véhicules" },
      { status: 500 }
    );
  }
}

// ============================
// POST /api/vehicles
// ============================
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["MANAGER", "AGENCE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session.user.role === "AGENCE" && !session.user.baseId) {
      return NextResponse.json(
        { error: "Compte agence sans base associée" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      licensePlate,
      brandId,
      modelId,
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

    if (!String(licensePlate ?? "").trim()) {
      return NextResponse.json({ error: "Immatriculation requise" }, { status: 400 });
    }

    let finalBaseId: string | null = baseId ? String(baseId) : null;
    let finalClientId: string | null = clientId ? String(clientId) : null;

    if (session.user.role === "AGENCE") {
      finalBaseId = session.user.baseId!;
      const base = await prisma.base.findUnique({
        where: { id: finalBaseId },
        select: { clientId: true },
      });

      if (!base) {
        return NextResponse.json({ error: "Base agence introuvable" }, { status: 400 });
      }

      finalClientId = base.clientId; 
    }

    if (session.user.role === "MANAGER") {
      if (!String(finalClientId ?? "").trim() || !String(finalBaseId ?? "").trim()) {
        return NextResponse.json(
          { error: "Immatriculation, client et agence requis" },
          { status: 400 }
        );
      }
    }

    if (year !== undefined && year !== null && year !== "") {
      const parsedYearCheck = parseOptionalInt(year);
      if (!parsedYearCheck || parsedYearCheck < 1900 || parsedYearCheck > 2100) {
        return NextResponse.json(
          { error: "L'année doit être un nombre valide entre 1900 et 2100" },
          { status: 400 }
        );
      }
    }

    if (finalBaseId) {
      const base = await prisma.base.findUnique({
        where: { id: String(finalBaseId) },
        select: { id: true, clientId: true },
      });

      if (!base) {
        return NextResponse.json({ error: "Agence invalide" }, { status: 400 });
      }

      if (finalClientId && base.clientId !== String(finalClientId)) {
        return NextResponse.json(
          { error: "Cette agence n'appartient pas au client sélectionné" },
          { status: 400 }
        );
      }
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
        brandId: brandId || null,
        modelId: modelId || null,
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

        clientId: finalClientId!,
        baseId: finalBaseId!,

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
