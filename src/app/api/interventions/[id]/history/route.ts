import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

function isPromise<T>(v: unknown): v is Promise<T> {
  return !!v && typeof v === "object" && typeof (v as any).then === "function";
}

async function getParamId(ctx: Ctx): Promise<string> {
  const p = isPromise<{ id: string }>(ctx.params) ? await ctx.params : ctx.params;
  return p?.id;
}

export async function GET(_request: NextRequest, context: Ctx) {
  try {
    const id = await getParamId(context);

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID d'intervention invalide" }, { status: 400 });
    }

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const intervention = await (prisma as any).intervention_int.findUnique({
      where: { int_id: id },
      select: {
        int_id: true,
        int_baseId: true,
        int_clientId: true,
        int_vehicle: {
          select: {
            veh_baseId: true,
            veh_clientId: true,
          },
        },
      },
    }) as {
      int_id: string;
      int_baseId: string | null;
      int_clientId: string | null;
      int_vehicle: { veh_baseId: string; veh_clientId: string };
    } | null;

    if (!intervention) {
      return NextResponse.json({ error: "Intervention non trouvée" }, { status: 404 });
    }

    if (session.user.role === "AGENCE") {
      const userBaseId = session.user.baseId;
      if (!userBaseId) {
        return NextResponse.json({ error: "Compte agence sans baseId" }, { status: 403 });
      }
      // Utiliser int_baseId (agence au moment de l'intervention) avec fallback sur veh_baseId actuel
      const interventionBaseId = intervention.int_baseId ?? intervention.int_vehicle.veh_baseId;
      if (interventionBaseId !== userBaseId) {
        return NextResponse.json(
          { error: "Vous ne pouvez pas consulter l'historique d'une autre agence" },
          { status: 403 }
        );
      }
    }

    if (session.user.role === "CLIENT") {
      const userClientId = session.user.clientId;
      if (!userClientId) {
        return NextResponse.json({ error: "Compte client sans clientId" }, { status: 403 });
      }
      // Utiliser int_clientId (client au moment de l'intervention) avec fallback sur veh_clientId actuel
      const interventionClientId = intervention.int_clientId ?? intervention.int_vehicle.veh_clientId;
      if (interventionClientId !== userClientId) {
        return NextResponse.json(
          { error: "Vous ne pouvez pas consulter l'historique d'un autre client" },
          { status: 403 }
        );
      }
    }

    const history = await prisma.changehistory_chg.findMany({
      where: { chg_interventionId: id },
      include: {
        chg_user: {
          select: {
            usr_name: true,
            usr_email: true,
          },
        },
      },
      orderBy: { chg_changedAt: "desc" },
    });

    return NextResponse.json(
      history.map((item) => ({
        id: item.chg_id,
        interventionId: item.chg_interventionId,
        changedAt: item.chg_changedAt,
        fieldName: item.chg_fieldName,
        oldValue: item.chg_oldValue,
        newValue: item.chg_newValue,
        changeType: item.chg_changeType,
        user: item.chg_user
          ? { name: item.chg_user.usr_name, email: item.chg_user.usr_email }
          : null,
      }))
    );
  } catch (error: any) {
    logError("Failed to fetch change history", error);
    return NextResponse.json(
      { error: "Échec de la récupération de l'historique" },
      { status: 500 }
    );
  }
}
