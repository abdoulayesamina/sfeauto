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

const ALLOWED_STATUSES = [
  "CONFIRMED_IN_PLANNING",
  "WAITING_FOR_PARTS",
  "FIXING_STARTED",
  "FIXING_FINISHED",
] as const;

type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

function parseStatus(v: string | null): AllowedStatus | null {
  if (!v) return null;
  return (ALLOWED_STATUSES as readonly string[]).includes(v)
    ? (v as AllowedStatus)
    : null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["AGENCE", "ADMIN", "MANAGER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const sessionBaseId = session.user.baseId;
    if (session.user.role === "AGENCE" && !sessionBaseId) {
      return NextResponse.json(
        { error: "Compte agence sans baseId" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || null;
    const rawStatus = searchParams.get("status")?.trim() || null;
    const status = parseStatus(rawStatus);
    const take = Math.min(parseIntSafe(searchParams.get("take")) ?? 50, 200);
    const skip = Math.max(parseIntSafe(searchParams.get("skip")) ?? 0, 0);

    if (rawStatus && !status) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
    }

    const baseFilter =
      session.user.role === "AGENCE"
        ? sessionBaseId!
        : searchParams.get("baseId")?.trim() || null;

    const andFilters: any[] = [];

    if (baseFilter) {
      andFilters.push({
        int_vehicle: {
          is: {
            veh_baseId: baseFilter,
          },
        },
      });
    }

    if (status) {
      andFilters.push({
        int_status: status,
      });
    }

    if (search) {
      andFilters.push({
        OR: [
          {
            int_accordNumber: {
              contains: search,
            },
          },
          {
            int_workDescription: {
              contains: search,
            },
          },
          {
            int_ordersDetails: {
              contains: search,
            },
          },
          {
            int_comments: {
              contains: search,
            },
          },
          {
            int_vehicle: {
              is: {
                veh_licensePlate: {
                  contains: search,
                },
              },
            },
          },
          {
            int_vehicle: {
              is: {
                veh_brand: {
                  is: {
                    bra_name: {
                      contains: search,
                    },
                  },
                },
              },
            },
          },
          {
            int_vehicle: {
              is: {
                veh_model: {
                  is: {
                    mod_name: {
                      contains: search,
                    },
                  },
                },
              },
            },
          },
        ],
      });
    }

    const where = andFilters.length > 0 ? { AND: andFilters } : {};

    const [total, rows] = await prisma.$transaction([
      prisma.intervention_int.count({ where }),
      prisma.intervention_int.findMany({
        where,
        select: {
          int_id: true,
          int_interventionConfirmed: true,
          int_status: true,
          int_accordNumber: true,
          int_dateOfConfirmation: true,
          int_statusUpdatedAt: true,
          int_workDescription: true,
          int_didOrderParts: true,
          int_ordersDetails: true,
          int_comments: true,
          int_createdAt: true,
          int_updatedAt: true,

          int_vehicle: {
            select: {
              veh_id: true,
              veh_licensePlate: true,
              veh_year: true,
              veh_color: true,
              veh_client: {
                select: {
                  cli_id: true,
                  cli_name: true,
                },
              },
              veh_base: {
                select: {
                  bas_id: true,
                  bas_location: true,
                  bas_clientId: true,
                },
              },
              veh_brand: {
                select: {
                  bra_name: true,
                },
              },
              veh_model: {
                select: {
                  mod_name: true,
                },
              },
            },
          },

          photos: {
            select: {
              itp_id: true,
              itp_url: true,
              itp_createdAt: true,
            },
            orderBy: {
              itp_createdAt: "desc",
            },
          },

          int_handledBy: {
            select: {
              usr_id: true,
              usr_name: true,
              usr_email: true,
            },
          },

          devis: {
            select: {
              dev_id: true,
              dev_numdevis: true,
              dev_supprimee: true,
            },
          },
        },
        orderBy: {
          int_createdAt: "desc",
        },
        take,
        skip,
      }),
    ]);

    const interventions = rows.map((item) => ({
      id: item.int_id,
      invoiceConfirmed: item.int_interventionConfirmed,
      status: item.int_status,
      accordNumber: item.int_accordNumber,
      dateOfConfirmation: item.int_dateOfConfirmation?.toISOString() ?? null,
      statusUpdatedAt: item.int_statusUpdatedAt.toISOString(),
      workDescription: item.int_workDescription,
      didOrderParts: item.int_didOrderParts,
      ordersDetails: item.int_ordersDetails,
      comments: item.int_comments,
      createdAt: item.int_createdAt.toISOString(),
      updatedAt: item.int_updatedAt.toISOString(),

      vehicle: {
        id: item.int_vehicle.veh_id,
        licensePlate: item.int_vehicle.veh_licensePlate,
        brand: item.int_vehicle.veh_brand?.bra_name ?? null,
        model: item.int_vehicle.veh_model?.mod_name ?? null,
        year: item.int_vehicle.veh_year,
        color: item.int_vehicle.veh_color,
        client: {
          id: item.int_vehicle.veh_client.cli_id,
          name: item.int_vehicle.veh_client.cli_name,
        },
        base: {
          id: item.int_vehicle.veh_base.bas_id,
          location: item.int_vehicle.veh_base.bas_location,
          clientId: item.int_vehicle.veh_base.bas_clientId,
        },
      },

      photos: item.photos.map((p) => ({
        id: p.itp_id,
        url: p.itp_url,
        createdAt: p.itp_createdAt.toISOString(),
      })),

      handledBy: item.int_handledBy
        ? {
            id: item.int_handledBy.usr_id,
            name: item.int_handledBy.usr_name,
            email: item.int_handledBy.usr_email,
          }
        : null,

      devis:
        item.devis && !item.devis.dev_supprimee
          ? {
              dev_id: item.devis.dev_id,
              dev_numdevis: item.devis.dev_numdevis,
            }
          : null,
    }));

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