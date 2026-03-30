import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { logError } from "@/src/lib/logger";

// GET /api/client/vehicles - Get all vehicles for the logged-in client's company
export async function GET() {
  try {
    const session = await auth();

    if (!session) {
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
        invoices: {
          select: {
            inv_id: true,
            inv_status: true,
            inv_invoiceConfirmed: true,
            inv_workDescription: true,
            inv_accordNumber: true,
            inv_dateOfConfirmation: true,
            inv_createdAt: true,
          },
          orderBy: {
            inv_createdAt: "desc",
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
      if (vehicle.invoices.length === 0) {
        stats.noIntervention++;
      } else {
        const hasInProgress = vehicle.invoices.some(
          (i) => i.inv_status !== "FIXING_FINISHED"
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
      invoices: v.invoices.map((inv) => ({
        id: inv.inv_id,
        status: inv.inv_status,
        invoiceConfirmed: inv.inv_invoiceConfirmed,
        workDescription: inv.inv_workDescription,
        accordNumber: inv.inv_accordNumber,
        dateOfConfirmation: inv.inv_dateOfConfirmation?.toISOString() ?? null,
        createdAt: inv.inv_createdAt.toISOString(),
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