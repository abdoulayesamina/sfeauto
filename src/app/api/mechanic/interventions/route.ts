import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { logError } from "@/src/lib/logger";
import { normalizePlate } from "@/src/utils/searchSmart";
import { adaptLegacyIntervention, STATUS_UI_MAP } from "@/src/utils/constants/intervention-status";

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

    // console.log(`[API Interventions] GET started. search=${search}, clientId=${clientId}, baseId=${baseId}, status=${uiStatus}`);

    let whereClause: any = {
      int_supprimee: false,
      int_annulee: false,
      int_vehicle: { veh_absent: false },
    };

    // Handle different status filters
    if (uiStatus === "EN_ATTENTE_ACCORD") {
      // Interventions waiting for approval : le nouveau statut dédié
      // (interventions créées après la migration) OU l'ancien schéma
      // "FIXING_STARTED sans n° d'accord" (interventions plus anciennes,
      // jamais retro-migrées) — même logique de compatibilité que
      // adaptLegacyIntervention côté client.
      whereClause.OR = [
        { int_status: "WAITING_FOR_APPROVAL" },
        { int_status: "FIXING_STARTED", int_accordNumber: null },
      ];
    } else if (uiStatus === "EN_COURS") {
      // Interventions in progress: FIXING_STARTED with accordNumber (and not "REFUSE")
      whereClause.int_status = "FIXING_STARTED";
      whereClause.AND = [
        { int_accordNumber: { not: null } },
        { int_accordNumber: { not: "REFUSE" } }
      ];
    } else if (uiStatus === "TERMINEE") {
      whereClause.int_status = "FIXING_FINISHED";
    } else if (uiStatus === "ATTENTE_PIECES") {
      whereClause.int_status = "WAITING_FOR_PARTS";
    } else if (uiStatus === "REFUSEE") {
      // Show only refused interventions (read-only)
      whereClause.OR = [
        { int_status: "REFUSED" },
        { int_accordNumber: "REFUSE" }
      ];
    } else if (uiStatus === "ANNULEE") {
      // Show only cancelled interventions (read-only)
      whereClause.int_annulee = true;
    } else {
      // Default: exclude refused, cancelled, and deleted
      whereClause.int_status = { notIn: ["CANCELLED", "REFUSED", "DELETED"] };
    }

    // Always exclude "REFUSE" accordNumber for non-refused/non-cancelled tabs
    if (uiStatus !== "REFUSEE" && uiStatus !== "ANNULEE" && uiStatus !== "EN_ATTENTE_ACCORD" && uiStatus !== "EN_COURS") {
      whereClause.AND = [
        { int_accordNumber: { not: "REFUSE" } }
      ];
    }

    // Handle vehicle filters (client/base)
    if (baseId || clientId) {
      const vehicleFilter: any = { veh_absent: false };
      if (baseId) vehicleFilter.veh_baseId = baseId;
      if (clientId) vehicleFilter.veh_clientId = clientId;
      
      if (whereClause.OR) {
        // For refused tab with OR, we need to wrap it properly
        whereClause = {
          int_supprimee: false,
          int_annulee: uiStatus === "ANNULEE" ? true : false,
          int_vehicle: { veh_absent: false, ...vehicleFilter },
          OR: whereClause.OR
        };
      } else {
        // Merge vehicle filter
        whereClause.int_vehicle = { is: vehicleFilter };
      }
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

    const serialized = interventions.map((intervention) => {
      const adapted = adaptLegacyIntervention(intervention);
      const uiStatus = STATUS_UI_MAP[adapted.int_status as keyof typeof STATUS_UI_MAP] || "FIXING_STARTED";
      
      return {
        id: intervention.int_id,
        accordNumber: intervention.int_accordNumber,
        dateOfConfirmation:
          intervention.int_dateOfConfirmation?.toISOString() ?? null,
        interventionConfirmed: intervention.int_interventionConfirmed,
        status: uiStatus,
        dbStatus: adapted.int_status,
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
      };
    });

    return NextResponse.json(serialized);
  } catch (error) {
    logError("Failed to fetch interventions", error);
    return NextResponse.json(
      { error: "Échec de la récupération des interventions" },
      { status: 500 }
    );
  }
}