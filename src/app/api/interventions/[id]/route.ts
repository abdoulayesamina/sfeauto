import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

function isPromise<T>(v: any): v is Promise<T> {
  return v && typeof v === "object" && typeof v.then === "function";
}

async function getParamId(ctx: Ctx): Promise<string> {
  const p = isPromise<{ id: string }>(ctx.params) ? await ctx.params : ctx.params;
  return p?.id;
}

function normalizeNullableString(value: unknown): string | null {
  if (typeof value !== "string") return value == null ? null : String(value);
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseNullableDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const d = new Date(String(value));
  if (Number.isNaN(d.getTime())) {
    throw new Error("INVALID_DATE");
  }
  return d;
}

export async function PATCH(request: NextRequest, context: Ctx) {
  try {
    const session = await auth();

    if (!session?.user || !["MANAGER", "ADMIN", "MECHANIC"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = await getParamId(context);

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID d'intervention invalide" }, { status: 400 });
    }

    const body = await request.json();

    const currentIntervention = await prisma.intervention_int.findUnique({
      where: { int_id: id },
      include: {
        photos: {
          select: {
            itp_id: true,
            itp_url: true,
          },
        },
      },
    });

    if (!currentIntervention) {
      return NextResponse.json({ error: "Intervention non trouvée" }, { status: 404 });
    }

    let parsedDateFromBody: Date | null | undefined = undefined;

    if ("dateOfConfirmation" in body) {
      try {
        parsedDateFromBody = parseNullableDate(body.dateOfConfirmation);
      } catch {
        return NextResponse.json({ error: "Date de confirmation invalide" }, { status: 400 });
      }

      if (parsedDateFromBody) {
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (parsedDateFromBody > today) {
          return NextResponse.json(
            { error: "La date de confirmation ne peut pas être dans le futur" },
            { status: 400 }
          );
        }
      }
    }

    const normalizedAccordNumber =
      "accordNumber" in body ? normalizeNullableString(body.accordNumber) : undefined;

      const refuse = normalizedAccordNumber== "REFUSE";
    console.log("Vérification numéro d'accord :", normalizedAccordNumber);
    if (normalizedAccordNumber && !refuse ) {
      const existing = await prisma.intervention_int.findFirst({
        where: {
          int_accordNumber: normalizedAccordNumber,
          NOT: { int_id: id },
        },
        select: {
          int_id: true,
          int_createdAt: true,
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            error: "Numéro d’accord déjà utilisé",
            code: "ACCORD_NUMBER_ALREADY_EXISTS",
            details: {
              accordNumber: normalizedAccordNumber,
              interventionId: existing.int_id,
              createdAt: existing.int_createdAt,
            },
          },
          { status: 409 }
        );
      }
    }

    const changeHistoryEntries: any[] = [];

    const fieldsToTrack = [
      "accordNumber",
      "dateOfConfirmation",
      "workDescription",
      "didOrderParts",
      "ordersDetails",
      "comments",
    ] as const;

    const fieldMap = {
      accordNumber: "int_accordNumber",
      dateOfConfirmation: "int_dateOfConfirmation",
      workDescription: "int_workDescription",
      didOrderParts: "int_didOrderParts",
      ordersDetails: "int_ordersDetails",
      comments: "int_comments",
    } as const;

    for (const field of fieldsToTrack) {
      if (!(field in body)) continue;

      const prismaField = fieldMap[field];

      let oldValue = currentIntervention[prismaField as keyof typeof currentIntervention] as any;
      let newValue: any = body[field];

      if (field === "accordNumber" || field === "workDescription" || field === "ordersDetails" || field === "comments") {
        oldValue = oldValue ? String(oldValue) : null;
        newValue = normalizeNullableString(newValue);
      }

      if (field === "dateOfConfirmation") {
        oldValue = oldValue ? new Date(oldValue).toISOString() : null;
        newValue = parsedDateFromBody ? parsedDateFromBody.toISOString() : null;
      }

      if (field === "didOrderParts") {
        oldValue = Boolean(oldValue);
        newValue = Boolean(newValue);
      }

      if (String(oldValue) !== String(newValue)) {
        changeHistoryEntries.push({
          chg_interventionId: id,
          chg_changedBy: session.user.id,
          chg_fieldName: field,
          chg_oldValue: oldValue !== null && oldValue !== undefined ? String(oldValue) : null,
          chg_newValue: newValue !== null && newValue !== undefined ? String(newValue) : null,
          chg_changeType: "updated",
        });
      }
    }

    const finalAccordNumber =
      normalizedAccordNumber !== undefined
        ? normalizedAccordNumber
        : currentIntervention.int_accordNumber;

    const finalDateOfConfirmation =
      parsedDateFromBody !== undefined
        ? parsedDateFromBody
        : currentIntervention.int_dateOfConfirmation;

    const finalDidOrderParts =
      "didOrderParts" in body
        ? Boolean(body.didOrderParts)
        : currentIntervention.int_didOrderParts;

    const wasUnapproved = !currentIntervention.int_interventionConfirmed;
    const nowApproved = Boolean(finalAccordNumber && finalAccordNumber!=="REFUSE" && finalDateOfConfirmation);

    if (wasUnapproved && nowApproved) {
      changeHistoryEntries.push({
        chg_interventionId: id,
        chg_changedBy: session.user.id,
        chg_fieldName: "interventionConfirmed",
        chg_oldValue: "false",
        chg_newValue: "true",
        chg_changeType: "approved",
      });
    }

    let nextStatus = currentIntervention.int_status;

    const isAlreadyInProgressOrDone =
      currentIntervention.int_status === "FIXING_STARTED" ||
      currentIntervention.int_status === "FIXING_FINISHED";

    if (!isAlreadyInProgressOrDone && nowApproved) {
      nextStatus = finalDidOrderParts ? "WAITING_FOR_PARTS" : "FIXING_STARTED";
    }

    const statusChanged = nextStatus !== currentIntervention.int_status;

    if (statusChanged) {
      changeHistoryEntries.push({
        chg_interventionId: id,
        chg_changedBy: session.user.id,
        chg_fieldName: "status",
        chg_oldValue: currentIntervention.int_status,
        chg_newValue: nextStatus,
        chg_changeType: "status_updated",
      });
    }

    const updateData: any = {};

    if ("accordNumber" in body) {
      updateData.int_accordNumber = normalizedAccordNumber;
    }

    if ("dateOfConfirmation" in body) {
      updateData.int_dateOfConfirmation = parsedDateFromBody ?? null;
    }

    if ("workDescription" in body) {
      updateData.int_workDescription = normalizeNullableString(body.workDescription);
    }

    if ("didOrderParts" in body) {
      updateData.int_didOrderParts = Boolean(body.didOrderParts);
    }

    if ("ordersDetails" in body) {
      updateData.int_ordersDetails = normalizeNullableString(body.ordersDetails);
    }

    if ("comments" in body) {
      updateData.int_comments = normalizeNullableString(body.comments);
    }

    if ("kilometrage" in body) {
      updateData.int_kilometrage = normalizeNullableString(body.kilometrage);
    }

    updateData.int_interventionConfirmed = nowApproved;

    if (statusChanged) {
      updateData.int_status = nextStatus;
      updateData.int_statusUpdatedAt = new Date();
    }
    console.log("Execution !!!");
    const updatedIntervention = await prisma.intervention_int.update({
      where: { int_id: id },
      data: updateData,
      include: {
        int_vehicle: {
          include: {
            veh_client: true,
            veh_base: true,
          },
        },
        int_handledBy: {
          select: {
            usr_name: true,
            usr_email: true,
          },
        },
        photos: {
          select: {
            itp_id: true,
            itp_url: true,
          },
        },
      },
    });

    console.log("Execution 22 !!!");
    if (changeHistoryEntries.length > 0) {
      await prisma.changehistory_chg.createMany({
        data: changeHistoryEntries,
      });
    }

    if (statusChanged) {
      await prisma.statushistory_sth.create({
        data: {
          sth_interventionId: id,
          sth_previousStatus: currentIntervention.int_status,
          sth_newStatus: nextStatus,
          sth_changedById: session.user.id,
        },
      });
    }

    return NextResponse.json({
      intervention: updatedIntervention,
      changes: changeHistoryEntries.length,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          error: "Numéro d’accord déjà utilisé",
          code: "ACCORD_NUMBER_ALREADY_EXISTS",
        },
        { status: 409 }
      );
    }

    logError("Failed to update intervention", error);

    return NextResponse.json(
      { error: "Échec de la mise à jour de l'intervention" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: Ctx) {
  try {
    const session = await auth();

    if (!session?.user || !["MANAGER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = await getParamId(context);

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID d'intervention invalide" }, { status: 400 });
    }

    const intervention = await prisma.intervention_int.findUnique({
      where: { int_id: id },
      include: { devis: true },
    });

    if (!intervention) {
      return NextResponse.json({ error: "Intervention non trouvée" }, { status: 404 });
    }

    if (intervention.int_supprimee) {
      return NextResponse.json({ error: "Intervention déjà supprimée" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Soft-delete l'intervention
      await tx.intervention_int.update({
        where: { int_id: id },
        data: { int_supprimee: true },
      });

      // 2. Soft-delete le devis associé si présent
      if (intervention.devis) {
        await tx.te_devis_dev.update({
          where: { dev_id: intervention.devis.dev_id },
          data: { dev_supprimee: true },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logError("Failed to delete intervention", error);
    return NextResponse.json(
      { error: "Échec de la suppression de l'intervention" },
      { status: 500 }
    );
  }
}