import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

// Helpers
function parseIntSafe(v: string | null): number | null {
  if (!v) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    //  Autorisé: AGENCE (optionnel: ADMIN / MANAGER aussi)
    if (!session?.user || !["AGENCE", "ADMIN", "MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const baseId = session.user.baseId;
    if (session.user.role === "AGENCE" && !baseId) {
      return NextResponse.json({ error: "Compte agence sans baseId" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);

    // Filtres optionnels
    const search = searchParams.get("search")?.trim() || null; // immatriculation ou accordNumber
    const status = searchParams.get("status")?.trim() || null; // WorkStatus
    const take = Math.min(parseIntSafe(searchParams.get("take")) ?? 50, 200);
    const skip = parseIntSafe(searchParams.get("skip")) ?? 0;

    //  Filtre base: si role AGENCE => uniquement sa base
    const baseFilter =
      session.user.role === "AGENCE"
        ? baseId
        : (searchParams.get("baseId")?.trim() || null);

    const where: any = {
      vehicle: {
        ...(baseFilter ? { baseId: baseFilter } : {}),
        ...(search
          ? {
              OR: [
                { licensePlate: { contains: search } },
                { brand: { contains: search } },
                { model: { contains: search } },
              ],
            }
          : {}),
      },
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { accordNumber: { contains: search } },
              { workDescription: { contains: search } },
              { ordersDetails: { contains: search } },
              { comments: { contains: search } },
            ],
          }
        : {}),
    };

    const [total, interventions] = await prisma.$transaction([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
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

          vehicle: {
            select: {
              id: true,
              licensePlate: true,
              brand: true,
              model: true,
              year: true,
              color: true,
              client: { select: { id: true, name: true } },
              base: { select: { id: true, location: true, clientId: true } },
            },
          },

          photos: {
            select: { id: true, url: true },
            orderBy: { createdAt: "desc" },
          },

          handledBy: { select: { id: true, name: true, email: true } },

          devis: {
            where: { dev_supprimee: false },
            select: { dev_id: true, dev_numdevis: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
    ]);

    return NextResponse.json({
      total,
      take,
      skip,
      interventions,
      baseId: baseFilter ?? null,
    });
  } catch (error) {
    logError("Failed to fetch agence interventions", error);
    return NextResponse.json(
      { error: "Échec de la récupération des interventions" },
      { status: 500 }
    );
  }
}
