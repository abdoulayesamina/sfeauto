import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { logError } from "@/src/lib/logger";

// GET /api/client/vehicles - Get all vehicles for the logged-in client's company
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session.user.role !== "CLIENT") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 });
    }

    const clientId = session.user.clientId;

    if (!clientId) {
      return NextResponse.json(
        { error: "Utilisateur non associé à une entreprise" },
        { status: 400 }
      );
    }

    const vehicles = await prisma.vehicle_veh.findMany({
      where: {
        veh_clientId: clientId,
      },
      include: {
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
        interventions: {
          select: {
            int_id: true,
            int_status: true,
            int_interventionConfirmed: true,
            int_workDescription: true,
            int_accordNumber: true,
            int_dateOfConfirmation: true,
            int_createdAt: true,
            int_updatedAt: true,
          },
          orderBy: {
            int_createdAt: "desc",
          },
        },
      },
      orderBy: {
        veh_createdAt: "desc",
      },
    });

    const stats = {
      total: vehicles.length,
      inProgress: 0,
      completed: 0,
      noIntervention: 0,
    };

    vehicles.forEach((vehicle) => {
      if (vehicle.interventions.length === 0) {
        stats.noIntervention++;
      } else {
        const hasInProgress = vehicle.interventions.some(
          (i) => i.int_status !== "FIXING_FINISHED"
        );

        if (hasInProgress) {
          stats.inProgress++;
        } else {
          stats.completed++;
        }
      }
    });

    const serializedVehicles = vehicles.map((v) => ({
      id: v.veh_id,
      licensePlate: v.veh_licensePlate,
      normalizedPlate: v.veh_normalizedPlate,
      year: v.veh_year,
      color: v.veh_color,
      firstRegistrationDate: v.veh_firstRegistrationDate?.toISOString() ?? null,
      energy: v.veh_energy,
      doorsCount: v.veh_doorsCount,
      bodyType: v.veh_bodyType,
      realPowerHp: v.veh_realPowerHp,
      fiscalPowerCv: v.veh_fiscalPowerCv,
      gearboxType: v.veh_gearboxType,
      version: v.veh_version,
      registrationCardDate: v.veh_registrationCardDate?.toISOString() ?? null,
      entryDate: v.veh_entryDate.toISOString(),
      exitDate: v.veh_exitDate?.toISOString() ?? null,
      createdAt: v.veh_createdAt.toISOString(),
      updatedAt: v.veh_updatedAt.toISOString(),
      clientId: v.veh_clientId,
      baseId: v.veh_baseId,
      handledById: v.veh_handledById,
      brandId: v.veh_brandId,
      modelId: v.veh_modelId,

      client: {
        id: v.veh_client.cli_id,
        name: v.veh_client.cli_name,
      },

      base: {
        id: v.veh_base.bas_id,
        location: v.veh_base.bas_location,
        clientId: v.veh_base.bas_clientId,
      },

      brand: v.veh_brand
        ? {
            id: v.veh_brand.bra_id,
            name: v.veh_brand.bra_name,
          }
        : null,

      model: v.veh_model
        ? {
            id: v.veh_model.mod_id,
            name: v.veh_model.mod_name,
          }
        : null,

      interventions: v.interventions.map((intervention) => ({
        id: intervention.int_id,
        status: intervention.int_status,
        interventionConfirmed: intervention.int_interventionConfirmed,
        workDescription: intervention.int_workDescription,
        accordNumber: intervention.int_accordNumber,
        dateOfConfirmation:
          intervention.int_dateOfConfirmation?.toISOString() ?? null,
        createdAt: intervention.int_createdAt.toISOString(),
        updatedAt: intervention.int_updatedAt.toISOString(),
      })),
    }));

    const bases = await prisma.base_bas.findMany({
      where: {
        bas_clientId: clientId,
      },
      select: {
        bas_id: true,
        bas_location: true,
        bas_clientId: true,
      },
      orderBy: {
        bas_location: "asc",
      },
    });

    const formattedBases = bases.map((base) => ({
      id: base.bas_id,
      location: base.bas_location,
      clientId: base.bas_clientId,
    }));

    return NextResponse.json({
      vehicles: serializedVehicles,
      bases: formattedBases,
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