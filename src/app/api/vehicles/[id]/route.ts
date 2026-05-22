import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

type Ctx = {
  params: Promise<{ id: string }>;
};

async function getParamId(context: Ctx): Promise<string> {
  const params = await context.params;
  return params.id;
}

export async function PATCH(request: NextRequest, context: Ctx) {
  try {
    const session = await auth();

    if (!session?.user || !["MANAGER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = await getParamId(context);

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID de véhicule invalide" }, { status: 400 });
    }

    const body = await request.json();
    const { veh_clientId: clientId, veh_baseId: baseId } = body;

    const vehicle = await prisma.vehicle_veh.findUnique({
      where: { veh_id: id },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
    }

    const updateData: any = {};

    if (clientId !== undefined) {
      if (!clientId) {
        return NextResponse.json({ error: "Client requis" }, { status: 400 });
      }
      updateData.veh_clientId = clientId;
    }

    if (baseId !== undefined) {
      if (!baseId) {
        return NextResponse.json({ error: "Agence requise" }, { status: 400 });
      }
      updateData.veh_baseId = baseId;
    }

    const finalClientId = updateData.veh_clientId ?? vehicle.veh_clientId;
    const finalBaseId = updateData.veh_baseId ?? vehicle.veh_baseId;

    if (updateData.veh_clientId || updateData.veh_baseId) {
      const base = await prisma.base_bas.findUnique({
        where: { bas_id: finalBaseId },
        select: {
          bas_id: true,
          bas_clientId: true,
        },
      });

      if (!base) {
        return NextResponse.json({ error: "Agence introuvable" }, { status: 400 });
      }

      if (base.bas_clientId !== finalClientId) {
        return NextResponse.json(
          { error: "Cette agence n'appartient pas au client sélectionné" },
          { status: 400 }
        );
      }
    }

    const updatedVehicle = await prisma.vehicle_veh.update({
      where: { veh_id: id },
      data: updateData,
    });

    return NextResponse.json({ vehicle: updatedVehicle });
  } catch (error: any) {
    logError("Failed to update vehicle", error);
    return NextResponse.json(
      { error: "Échec de la mise à jour du véhicule" },
      { status: 500 }
    );
  }
}
