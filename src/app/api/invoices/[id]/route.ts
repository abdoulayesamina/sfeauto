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

    const currentInvoice = await prisma.invoice_inv.findUnique({
      where: { inv_id: id },
    });

    if (!currentInvoice) {
      return NextResponse.json({ error: "Intervention non trouvée" }, { status: 404 });
    }

    if (body.dateOfConfirmation) {
      const confirmationDate = new Date(body.dateOfConfirmation);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (confirmationDate > today) {
        return NextResponse.json(
          { error: "La date de confirmation ne peut pas être dans le futur" },
          { status: 400 }
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
      accordNumber: "inv_accordNumber",
      dateOfConfirmation: "inv_dateOfConfirmation",
      workDescription: "inv_workDescription",
      didOrderParts: "inv_didOrderParts",
      ordersDetails: "inv_ordersDetails",
      comments: "inv_comments",
    } as const;

    for (const field of fieldsToTrack) {
      if (field in body) {
        const prismaField = fieldMap[field];
        let oldValue = currentInvoice[prismaField as keyof typeof currentInvoice];
        let newValue = body[field];

        if (field === "dateOfConfirmation") {
          oldValue = oldValue ? new Date(oldValue as any).toISOString() : null;
          newValue = newValue ? new Date(newValue).toISOString() : null;
        }

        if (String(oldValue) !== String(newValue)) {
          changeHistoryEntries.push({
            chg_invoiceId: id,
            chg_changedBy: session.user.id,
            chg_fieldName: field,
            chg_oldValue: oldValue ? String(oldValue) : null,
            chg_newValue: newValue ? String(newValue) : null,
            chg_changeType: "updated",
          });
        }
      }
    }

    const wasUnapproved = !currentInvoice.inv_invoiceConfirmed;
    const hasAccordNumber =
      ("accordNumber" in body ? body.accordNumber : currentInvoice.inv_accordNumber) ?? null;
    const hasDate =
      ("dateOfConfirmation" in body
        ? body.dateOfConfirmation
        : currentInvoice.inv_dateOfConfirmation) ?? null;

    const nowApproved = Boolean(hasAccordNumber && hasDate);

    if (wasUnapproved && nowApproved) {
      changeHistoryEntries.push({
        chg_invoiceId: id,
        chg_changedBy: session.user.id,
        chg_fieldName: "invoiceConfirmed",
        chg_oldValue: "false",
        chg_newValue: "true",
        chg_changeType: "approved",
      });
    }

    const updateData: any = {};
    if ("accordNumber" in body) updateData.inv_accordNumber = body.accordNumber || null;
    if ("dateOfConfirmation" in body) {
      updateData.inv_dateOfConfirmation = body.dateOfConfirmation
        ? new Date(body.dateOfConfirmation)
        : null;
    }
    if ("workDescription" in body) updateData.inv_workDescription = body.workDescription ?? null;
    if ("didOrderParts" in body) updateData.inv_didOrderParts = Boolean(body.didOrderParts);
    if ("ordersDetails" in body) updateData.inv_ordersDetails = body.ordersDetails ?? null;
    if ("comments" in body) updateData.inv_comments = body.comments ?? null;

    updateData.inv_invoiceConfirmed = nowApproved;
    updateData.inv_updatedAt = new Date();

    const updatedInvoice = await prisma.invoice_inv.update({
      where: { inv_id: id },
      data: updateData,
      include: {
        inv_vehicle: {
          include: {
            veh_client: true,
            veh_base: true,
          },
        },
        inv_handledBy: {
          select: {
            usr_name: true,
            usr_email: true,
          },
        },
        photos: {
          select: {
            ivp_id: true,
            ivp_url: true,
          },
        },
      },
    });

    if (changeHistoryEntries.length > 0) {
      await prisma.changehistory_chg.createMany({ data: changeHistoryEntries });
    }

    return NextResponse.json({
      invoice: updatedInvoice,
      changes: changeHistoryEntries.length,
    });
  } catch (error: any) {
    logError("Failed to update invoice", error);
    return NextResponse.json(
      { error: "Échec de la mise à jour de l'intervention" },
      { status: 500 }
    );
  }
}