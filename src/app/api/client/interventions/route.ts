import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { logError } from "@/src/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    // Only clients can access this endpoint
    if (!session?.user || session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search")?.trim();

    if (!search) {
      return NextResponse.json({ error: "Recherche requise" }, { status: 400 });
    }

    if (!session.user.clientId) {
      return NextResponse.json(
        { error: "Aucun client associé à cet utilisateur" },
        { status: 403 }
      );
    }

    const interventions = await prisma.intervention_int.findMany({
      where: {
        int_supprimee: false,
        OR: [
          {
            int_clientId: session.user.clientId,
          },
          {
            int_clientId: null,
            int_vehicle: {
              is: {
                veh_clientId: session.user.clientId,
              },
            },
          },
        ],
        int_vehicle: {
          is: {
            veh_licensePlate: {
              contains: search,
            },
          },
        },
      },
      include: {
        int_client: {
          select: {
            cli_name: true,
          },
        },
        int_base: {
          select: {
            bas_id: true,
            bas_location: true,
          },
        },
        int_vehicle: {
          include: {
            veh_client: {
              select: {
                cli_name: true,
              },
            },
            veh_base: {
              select: {
                bas_id: true,
                bas_location: true,
              },
            },
            veh_brand: {
              select: {
                bra_id: true,
                bra_name: true,
              },
            },
            veh_model: {
              select: {
                mod_id: true,
                mod_name: true,
              },
            },
          },
        },
        int_handledBy: {
          select: {
            usr_name: true,
            usr_email: true,
          },
        },
      },
      orderBy: [{ int_status: "asc" }, { int_createdAt: "desc" }],
    });

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
        id: intervention.int_vehicle.veh_id,
        licensePlate: intervention.int_vehicle.veh_licensePlate,
        brandId: intervention.int_vehicle.veh_brandId,
        modelId: intervention.int_vehicle.veh_modelId,
        brand: intervention.int_vehicle.veh_brand?.bra_name ?? null,
        model: intervention.int_vehicle.veh_model?.mod_name ?? null,
        year: intervention.int_vehicle.veh_year,
        color: intervention.int_vehicle.veh_color,
        client: {
          name: intervention.int_client?.cli_name ?? intervention.int_vehicle.veh_client.cli_name,
        },
        base: {
          id: intervention.int_baseId ?? intervention.int_vehicle.veh_base.bas_id,
          location: intervention.int_base?.bas_location ?? intervention.int_vehicle.veh_base.bas_location,
        },
      },
      handledBy: intervention.int_handledBy
        ? {
            name: intervention.int_handledBy.usr_name,
            email: intervention.int_handledBy.usr_email,
          }
        : null,
    }));

    return NextResponse.json(serialized);
  } catch (error) {
    logError("Failed to search interventions", error);
    return NextResponse.json(
      { error: "Échec de la recherche des interventions" },
      { status: 500 }
    );
  }
}