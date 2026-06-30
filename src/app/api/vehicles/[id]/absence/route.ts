import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: Ctx) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["MANAGER", "ADMIN", "MECHANIC"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID de véhicule invalide" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));

    if (typeof body?.absent !== "boolean") {
      return NextResponse.json(
        { error: "Le champ 'absent' (booléen) est requis" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle_veh.findUnique({
      where: { veh_id: id },
      select: { veh_id: true, veh_absent: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 });
    }

    const updated = await prisma.vehicle_veh.update({
      where: { veh_id: id },
      data: {
        veh_absent: body.absent,
        veh_dateAbsence: body.absent ? new Date() : null,
      },
      select: {
        veh_id: true,
        veh_absent: true,
        veh_dateAbsence: true,
      },
    });

    return NextResponse.json({ vehicle: updated });
  } catch (error: any) {
    logError("Failed to update vehicle absence", error);
    return NextResponse.json(
      { error: "Échec de la mise à jour de l'absence du véhicule" },
      { status: 500 }
    );
  }
}
