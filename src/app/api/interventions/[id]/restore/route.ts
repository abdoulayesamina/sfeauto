import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { notifyAdmins } from "@/src/lib/notifications";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

function isPromise<T>(v: any): v is Promise<T> {
  return v && typeof v === "object" && typeof v.then === "function";
}

async function getParamId(ctx: Ctx): Promise<string> {
  const p = isPromise<{ id: string }>(ctx.params)
    ? await ctx.params
    : ctx.params;
  return p?.id;
}

// Annule une annulation : remet int_annulee à false. int_status n'a jamais
// été modifié par cancel/route.ts, il reprend donc automatiquement sa valeur
// d'avant l'annulation (voir adaptLegacyIntervention).
export async function POST(request: NextRequest, context: Ctx) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["MANAGER", "ADMIN", "MECHANIC"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = await getParamId(context);

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "ID d'intervention invalide" },
        { status: 400 },
      );
    }

    const intervention = await prisma.intervention_int.findUnique({
      where: { int_id: id },
      select: {
        int_id: true,
        int_supprimee: true,
        int_annulee: true,
        int_vehicle: { select: { veh_absent: true, veh_licensePlate: true } },
      },
    });

    if (!intervention) {
      return NextResponse.json(
        { error: "Intervention non trouvée" },
        { status: 404 },
      );
    }

    if (intervention.int_supprimee) {
      return NextResponse.json(
        { error: "Intervention supprimée" },
        { status: 400 },
      );
    }

    if (!intervention.int_annulee) {
      return NextResponse.json(
        { error: "Intervention non annulée" },
        { status: 400 },
      );
    }

    if (intervention.int_vehicle?.veh_absent) {
      return NextResponse.json(
        { error: "Véhicule absent : aucune action possible sur cette intervention" },
        { status: 409 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.intervention_int.update({
        where: { int_id: id },
        data: {
          int_annulee: false,
          int_dateAnnulation: null,
        },
      });

      await tx.changehistory_chg.create({
        data: {
          chg_interventionId: id,
          chg_changedBy: session.user.id,
          chg_fieldName: "annulee",
          chg_oldValue: "true",
          chg_newValue: "false",
          chg_changeType: "restored",
        },
      });

      return result;
    });

    await notifyAdmins({
      type: "INTERVENTION_UPDATED",
      title: "Annulation annulée",
      message: `L'annulation de l'intervention du véhicule ${intervention.int_vehicle?.veh_licensePlate ?? ""} a été annulée : l'intervention est restaurée.`,
      interventionId: id,
      excludeUserId: session.user.id ?? null,
    });

    return NextResponse.json({ success: true, intervention: updated });
  } catch (error: any) {
    logError("Failed to restore intervention", error);
    return NextResponse.json(
      { error: "Échec de la restauration de l'intervention" },
      { status: 500 },
    );
  }
}
