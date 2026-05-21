import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { logError } from "@/src/lib/logger";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

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

    const vehicleInclude = {
      veh_client: { select: { cli_id: true, cli_name: true } },
      veh_base: { select: { bas_id: true, bas_location: true, bas_clientId: true } },
      veh_brand: { select: { bra_id: true, bra_name: true } },
      veh_model: { select: { mod_id: true, mod_name: true } },
    };

    const interventionSelect = {
      int_id: true,
      int_status: true,
      int_interventionConfirmed: true,
      int_workDescription: true,
      int_accordNumber: true,
      int_dateOfConfirmation: true,
      int_createdAt: true,
      int_updatedAt: true,
    };

    // 1. Véhicules actuellement liés à ce client
    const currentVehicles: any[] = await db.vehicle_veh.findMany({
      where: { veh_clientId: clientId },
      include: {
        ...vehicleInclude,
        interventions: {
          where: {
            int_supprimee: false,
            int_clientId: clientId,
          },
          select: interventionSelect,
          orderBy: { int_createdAt: "desc" },
        },
      },
      orderBy: { veh_createdAt: "desc" },
    });

    // 2. Véhicules transférés vers un autre client mais ayant des interventions
    //    créées quand ils appartenaient à ce client (int_clientId = clientId)
    const historicalRows: { int_vehicleId: string }[] = await db.intervention_int.findMany({
      where: {
        int_supprimee: false,
        int_clientId: clientId,
        int_vehicle: { veh_clientId: { not: clientId } },
      },
      select: { int_vehicleId: true },
      distinct: ["int_vehicleId"],
    });

    const transferredIds = historicalRows.map((r: any) => r.int_vehicleId);

    const transferredVehicles: any[] = transferredIds.length > 0
      ? await db.vehicle_veh.findMany({
          where: { veh_id: { in: transferredIds } },
          include: {
            ...vehicleInclude,
            // ne retourner que les interventions qui concernent ce client
            interventions: {
              where: { int_supprimee: false, int_clientId: clientId },
              select: interventionSelect,
              orderBy: { int_createdAt: "desc" },
            },
          },
        })
      : [];

    const serializeVehicle = (v: any, isTransferred: boolean) => ({
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
      isTransferred,
      client: { id: v.veh_client.cli_id, name: v.veh_client.cli_name },
      base: { id: v.veh_base.bas_id, location: v.veh_base.bas_location, clientId: v.veh_base.bas_clientId },
      brand: v.veh_brand ? { id: v.veh_brand.bra_id, name: v.veh_brand.bra_name } : null,
      model: v.veh_model ? { id: v.veh_model.mod_id, name: v.veh_model.mod_name } : null,
      interventions: (v.interventions ?? []).map((i: any) => ({
        id: i.int_id,
        status: i.int_status,
        interventionConfirmed: i.int_interventionConfirmed,
        workDescription: i.int_workDescription,
        accordNumber: i.int_accordNumber,
        dateOfConfirmation: i.int_dateOfConfirmation?.toISOString() ?? null,
        createdAt: i.int_createdAt.toISOString(),
        updatedAt: i.int_updatedAt.toISOString(),
      })),
    });

    const serializedVehicles = [
      ...currentVehicles.map((v: any) => serializeVehicle(v, false)),
      ...transferredVehicles.map((v: any) => serializeVehicle(v, true)),
    ];

    // Stats basées uniquement sur les véhicules actuels
    const stats = { total: currentVehicles.length, inProgress: 0, completed: 0, noIntervention: 0 };
    currentVehicles.forEach((v: any) => {
      if (!v.interventions?.length) stats.noIntervention++;
      else if (v.interventions.some((i: any) => i.int_status !== "FIXING_FINISHED")) stats.inProgress++;
      else stats.completed++;
    });

    const bases = await prisma.base_bas.findMany({
      where: { bas_clientId: clientId },
      select: { bas_id: true, bas_location: true, bas_clientId: true },
      orderBy: { bas_location: "asc" },
    });

    return NextResponse.json({
      vehicles: serializedVehicles,
      bases: bases.map((b) => ({ id: b.bas_id, location: b.bas_location, clientId: b.bas_clientId })),
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
