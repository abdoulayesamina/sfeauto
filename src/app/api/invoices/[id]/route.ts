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

    if (!session?.user || !["MANAGER", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = await getParamId(context);

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID d'intervention invalide" }, { status: 400 });
    }

    const body = await request.json();

    const currentInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!currentInvoice) {
      return NextResponse.json({ error: "Intervention non trouvée" }, { status: 404 });
    }

    // Validation date (si fournie)
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

    // Historique
    const changeHistoryEntries: any[] = [];
    const fieldsToTrack = [
      "accordNumber",
      "dateOfConfirmation",
      "workDescription",
      "didOrderParts",
      "ordersDetails",
      "comments",
    ];

    for (const field of fieldsToTrack) {
      if (field in body) {
        let oldValue = currentInvoice[field as keyof typeof currentInvoice];
        let newValue = body[field];

        if (field === "dateOfConfirmation") {
          oldValue = oldValue ? new Date(oldValue as any).toISOString() : null;
          newValue = newValue ? new Date(newValue).toISOString() : null;
        }

        if (String(oldValue) !== String(newValue)) {
          changeHistoryEntries.push({
            invoiceId: id,
            changedBy: session.user.id,
            fieldName: field,
            oldValue: oldValue ? String(oldValue) : null,
            newValue: newValue ? String(newValue) : null,
            changeType: "updated",
          });
        }
      }
    }

    // invoiceConfirmed auto si accordNumber + dateOfConfirmation
    const wasUnapproved = !currentInvoice.invoiceConfirmed;
    const hasAccordNumber = ("accordNumber" in body ? body.accordNumber : currentInvoice.accordNumber) ?? null;
    const hasDate =
      ("dateOfConfirmation" in body ? body.dateOfConfirmation : currentInvoice.dateOfConfirmation) ?? null;

    const nowApproved = Boolean(hasAccordNumber && hasDate);

    if (wasUnapproved && nowApproved) {
      changeHistoryEntries.push({
        invoiceId: id,
        changedBy: session.user.id,
        fieldName: "invoiceConfirmed",
        oldValue: "false",
        newValue: "true",
        changeType: "approved",
      });
    }

    const updateData: any = {};
    if ("accordNumber" in body) updateData.accordNumber = body.accordNumber || null;
    if ("dateOfConfirmation" in body)
      updateData.dateOfConfirmation = body.dateOfConfirmation ? new Date(body.dateOfConfirmation) : null;
    if ("workDescription" in body) updateData.workDescription = body.workDescription ?? null;
    if ("didOrderParts" in body) updateData.didOrderParts = Boolean(body.didOrderParts);
    if ("ordersDetails" in body) updateData.ordersDetails = body.ordersDetails ?? null;
    if ("comments" in body) updateData.comments = body.comments ?? null;

    updateData.invoiceConfirmed = nowApproved;
    updateData.updatedAt = new Date();

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        vehicle: { include: { client: true, base: true } },
        handledBy: { select: { name: true, email: true } },
        photos: { select: { id: true, url: true } },
      },
    });

    if (changeHistoryEntries.length > 0) {
      await prisma.changeHistory.createMany({ data: changeHistoryEntries });
    }

    return NextResponse.json({
      invoice: updatedInvoice,
      changes: changeHistoryEntries.length,
    });
  } catch (error: any) {
    logError("Failed to update invoice", error);
    return NextResponse.json({ error: "Échec de la mise à jour de l'intervention" }, { status: 500 });
  }
}
