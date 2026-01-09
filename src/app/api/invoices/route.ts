import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    console.log("[API /invoices] Body reçu :", body);

    const {
      vehicleId,
      accordNumber,
      dateOfConfirmation,
      workDescription,
      didOrderParts,
      ordersDetails,
      comments,
    } = body;

    console.log("[API /invoices] vehicleId :", vehicleId);
    console.log("[API /invoices] accordNumber :", accordNumber);
    console.log("[API /invoices] dateOfConfirmation :", dateOfConfirmation);
    console.log("[API /invoices] didOrderParts :", didOrderParts);
    console.log("[API /invoices] session.user.id :", session.user?.id);

    // Validate required fields
    if (!vehicleId) {
      return NextResponse.json(
        { error: "L'identifiant du véhicule est requis" },
        { status: 400 }
      );
    }

    // Calcul correct de invoiceConfirmed (Boolean)
    const hasAccordNumber = accordNumber && accordNumber.trim().length > 0;
    const invoiceConfirmed = hasAccordNumber && !!dateOfConfirmation;

    // Validate dateOfConfirmation (si fournie)
    if (dateOfConfirmation) {
      const confirmationDate = new Date(dateOfConfirmation);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (confirmationDate > today) {
        return NextResponse.json(
          { error: "La date de confirmation ne peut pas être dans le futur" },
          { status: 400 }
        );
      }
    }

    // Création de l'invoice
    const invoice = await prisma.invoice.create({
      data: {
        vehicleId,
        accordNumber: hasAccordNumber ? accordNumber : null,
        dateOfConfirmation: dateOfConfirmation ? new Date(dateOfConfirmation) : null,
        invoiceConfirmed,  
        status:
          invoiceConfirmed && didOrderParts
            ? "WAITING_FOR_PARTS"
            : "CONFIRMED_IN_PLANNING",
        workDescription,
        didOrderParts: didOrderParts || false,
        ordersDetails,
        comments,
        handledById: session.user.id,
      },
      include: {
        vehicle: {
          include: {
            client: true,
            base: true,
          },
        },
        handledBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("[API /invoices] Invoice créée :", invoice);

    // Historique de changement
    await prisma.changeHistory.create({
      data: {
        invoiceId: invoice.id,
        changedBy: session.user.id,
        fieldName: "created",
        newValue: JSON.stringify({
          invoiceConfirmed,
          accordNumber: accordNumber || null,
          dateOfConfirmation: dateOfConfirmation || null,
          workDescription: workDescription || null,
          didOrderParts: didOrderParts || false,
        }),
        changeType: "created",
      },
    });

    // Historique de status si pièces commandées
    if (invoiceConfirmed && didOrderParts) {
      await prisma.statusHistory.create({
        data: {
          invoiceId: invoice.id,
          previousStatus: "CONFIRMED_IN_PLANNING",
          newStatus: "WAITING_FOR_PARTS",
          changedById: session.user.id,
        },
      });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    // FK constraint (véhicule invalide)
    if (error.code === "P2003") {
      logError("Failed to create invoice - invalid vehicle", error);
      return NextResponse.json({ error: "Véhicule invalide" }, { status: 400 });
    }

    logError("Failed to create invoice", error);
    return NextResponse.json(
      { error: "Échec de la création de l'intervention" },
      { status: 500 }
    );
  }
}
