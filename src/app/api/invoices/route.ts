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
    const {
      vehicleId,
      accordNumber,
      dateOfConfirmation,
      workDescription,
      didOrderParts,
      ordersDetails,
      comments,
    } = body;

    // Validate required fields
    if (!vehicleId) {
      return NextResponse.json(
        { error: "L'identifiant du véhicule est requis" },
        { status: 400 }
      );
    }

    // Determine if this is an approved or unapproved intervention
    const hasAccordNumber = accordNumber && accordNumber.trim().length > 0;
    const invoiceConfirmed = hasAccordNumber && dateOfConfirmation;

    // Date of confirmation cannot be in the future (only validate if provided)
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

    // Create invoice - auto-set status to WAITING_FOR_PARTS if parts ordered AND approved
    // Vehicle existence validated by FK constraint (caught below)
    const invoice = await prisma.invoice.create({
      data: {
        vehicleId,
        accordNumber: hasAccordNumber ? accordNumber : null,
        dateOfConfirmation: dateOfConfirmation ? new Date(dateOfConfirmation) : null,
        invoiceConfirmed, // Conditional based on accord number and date presence
        status: invoiceConfirmed && didOrderParts ? 'WAITING_FOR_PARTS' : 'CONFIRMED_IN_PLANNING',
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

    // Create change history entry for creation
    await prisma.changeHistory.create({
      data: {
        invoiceId: invoice.id,
        changedBy: session.user.id,
        fieldName: 'created',
        newValue: JSON.stringify({
          invoiceConfirmed,
          accordNumber: accordNumber || null,
          dateOfConfirmation: dateOfConfirmation || null,
          workDescription: workDescription || null,
          didOrderParts: didOrderParts || false,
        }),
        changeType: 'created',
      },
    });

    // If parts were ordered AND intervention is approved, create a StatusHistory entry
    if (invoiceConfirmed && didOrderParts) {
      await prisma.statusHistory.create({
        data: {
          invoiceId: invoice.id,
          previousStatus: 'CONFIRMED_IN_PLANNING',
          newStatus: 'WAITING_FOR_PARTS',
          changedById: session.user.id,
        },
      });
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    // Handle FK constraint error (invalid vehicleId)
    if (error.code === 'P2003') {
      logError('Failed to create invoice - invalid vehicle', error);
      return NextResponse.json({ error: 'Véhicule invalide' }, { status: 400 });
    }

    logError('Failed to create invoice', error);
    return NextResponse.json(
      { error: "Échec de la création de l'intervention" },
      { status: 500 }
    );
  }
}
