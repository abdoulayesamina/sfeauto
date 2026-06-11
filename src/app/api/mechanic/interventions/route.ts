import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { logError } from "@/src/lib/logger";
import { normalizePlate } from "@/src/utils/searchSmart";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Only mechanics and admins can access this endpoint
    if (
      !session?.user ||
      (session.user.role !== "MECHANIC" && session.user.role !== "ADMIN")
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim();
    const clientId = searchParams.get("clientId")?.trim();
    const baseId = searchParams.get("baseId")?.trim();
    const uiStatus = searchParams.get("status")?.trim();

    console.log(`[API Interventions] GET started. search=${search}, clientId=${clientId}, baseId=${baseId}, status=${uiStatus}`);

    const whereClause: any = {
      int_supprimee: false,
    };

    if (uiStatus && uiStatus !== "ALL") {
      if (uiStatus === "EN_COURS") {
        whereClause.int_status = {
          in: ["FIXING_STARTED"],
        };
      } else if (uiStatus === "TERMINEE") {
        whereClause.int_status = "FIXING_FINISHED";
      } else if (uiStatus === "ATTENTE_PIECES") {
        whereClause.int_status = "WAITING_FOR_PARTS";
      }
    }

    if (baseId || clientId) {
      whereClause.int_vehicle = {
        is: {
          ...(baseId ? { veh_baseId: baseId } : {}),
          ...(clientId ? { veh_clientId: clientId } : {}),
        },
      };
    }

    if (search) {
      const normalized = normalizePlate(search);
      whereClause.OR = [
        {
          int_accordNumber: {
            contains: search,
          },
        },
        {
          int_vehicle: {
            is: {
              OR: [
                {
                  veh_licensePlate: {
                    contains: search,
                  },
                },
                {
                  veh_normalizedPlate: {
                    contains: normalized || search,
                  },
                },
              ],
            },
          },
        },
      ];
    }

    console.log("[API Interventions] Executing Prisma query with whereClause:", JSON.stringify(whereClause, null, 2));
    const startTime = Date.now();

    const interventions = await prisma.intervention_int.findMany({
      where: whereClause,
      include: {
        int_client: {
          select: { cli_id: true, cli_name: true },
        },
        int_base: {
          select: { bas_id: true, bas_location: true },
        },
        int_vehicle: {
          include: {
            veh_client: {
              select: { cli_id: true, cli_name: true },
            },
            veh_base: {
              select: { bas_id: true, bas_location: true },
            },
            veh_brand: {
              select: { bra_name: true },
            },
            veh_model: {
              select: { mod_name: true },
            },
          },
        },
        int_handledBy: {
          select: { usr_name: true, usr_email: true },
        },
        history: {
          include: {
            sth_user: {
              select: { usr_name: true },
            },
          },
          orderBy: {
            sth_changedAt: "asc",
          },
        },
      },
      orderBy: [{ int_status: "asc" }, { int_createdAt: "desc" }],
      take: 100,
    });

    console.log(`[API Interventions] Prisma query finished in ${Date.now() - startTime}ms. Found ${interventions.length} results.`);

    const serialized = interventions.map((intervention) => ({
      id: intervention.int_id,
      accordNumber: intervention.int_accordNumber,
      dateOfConfirmation:
        intervention.int_dateOfConfirmation?.toISOString() ?? null,
      interventionConfirmed: intervention.int_interventionConfirmed,
      status: intervention.int_status,
      statusUpdatedAt: intervention.int_statusUpdatedAt.toISOString(),
      workDescription: intervention.int_workDescription,
      didOrderParts: intervention.int_didOrderParts,
      ordersDetails: intervention.int_ordersDetails,
      comments: intervention.int_comments,
      createdAt: intervention.int_createdAt.toISOString(),
      updatedAt: intervention.int_updatedAt.toISOString(),
      vehicle: {
        id: intervention.int_vehicle?.veh_id ?? "unknown",
        licensePlate: intervention.int_vehicle?.veh_licensePlate ?? "Inconnue",
        brand: intervention.int_vehicle?.veh_brand?.bra_name ?? null,
        model: intervention.int_vehicle?.veh_model?.mod_name ?? null,
        year: intervention.int_vehicle?.veh_year,
        color: intervention.int_vehicle?.veh_color,
        client: {
          id: intervention.int_clientId ?? intervention.int_vehicle?.veh_client?.cli_id ?? "unknown",
          name: intervention.int_client?.cli_name ?? intervention.int_vehicle?.veh_client?.cli_name ?? "Client inconnu",
        },
        base: {
          id: intervention.int_baseId ?? intervention.int_vehicle?.veh_base?.bas_id ?? "unknown",
          location: intervention.int_base?.bas_location ?? intervention.int_vehicle?.veh_base?.bas_location ?? "Lieu inconnu",
        },
      },
      handledBy: intervention.int_handledBy
        ? {
          name: intervention.int_handledBy.usr_name,
          email: intervention.int_handledBy.usr_email,
        }
        : null,
      statusHistory: intervention.history.map((h) => ({
        id: h.sth_id,
        previousStatus: h.sth_previousStatus,
        newStatus: h.sth_newStatus,
        changedAt: h.sth_changedAt.toISOString(),
        changedBy: h.sth_changedById,
        changedByName: h.sth_user.usr_name,
      })),
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    logError("Failed to fetch interventions", error);
    return NextResponse.json(
      { error: "Échec de la récupération des interventions" },
      { status: 500 }
    );
  }
}