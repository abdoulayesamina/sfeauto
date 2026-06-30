import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

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

    if (intervention.int_annulee) {
      return NextResponse.json(
        { error: "Intervention déjà annulée" },
        { status: 400 },
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.intervention_int.update({
        where: { int_id: id },
        data: {
          int_annulee: true,
          int_dateAnnulation: new Date(),
        },
      });

      await tx.changehistory_chg.create({
        data: {
          chg_interventionId: id,
          chg_changedBy: session.user.id,
          chg_fieldName: "annulee",
          chg_oldValue: "false",
          chg_newValue: "true",
          chg_changeType: "cancelled",
        },
      });

      return result;
    });

    return NextResponse.json({ success: true, intervention: updated });
  } catch (error: any) {
    logError("Failed to cancel intervention", error);
    return NextResponse.json(
      { error: "Échec de l'annulation de l'intervention" },
      { status: 500 },
    );
  }
}
