import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

// PATCH /api/invoices/[id] - Update an existing invoice
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || !['MANAGER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Get current invoice
    const currentInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!currentInvoice) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      );
    }

    // Validate date if provided
    if (body.dateOfConfirmation) {
      const confirmationDate = new Date(body.dateOfConfirmation);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (confirmationDate > today) {
        return NextResponse.json(
          { error: 'La date de confirmation ne peut pas être dans le futur' },
          { status: 400 }
        );
      }
    }

    // Track changes
    const changeHistoryEntries: any[] = [];

    // Fields to track for changes
    const fieldsToTrack = [
      'accordNumber',
      'dateOfConfirmation',
      'workDescription',
      'didOrderParts',
      'ordersDetails',
      'comments',
    ];

    for (const field of fieldsToTrack) {
      if (field in body) {
        let oldValue = currentInvoice[field];
        let newValue = body[field];

        // Handle date comparison
        if (field === 'dateOfConfirmation') {
          oldValue = oldValue ? new Date(oldValue).toISOString() : null;
          newValue = newValue ? new Date(newValue).toISOString() : null;
        }

        // Check if value actually changed
        if (String(oldValue) !== String(newValue)) {
          changeHistoryEntries.push({
            invoiceId: id,
            changedBy: session.user.id,
            fieldName: field,
            oldValue: oldValue ? String(oldValue) : null,
            newValue: newValue ? String(newValue) : null,
            changeType: 'updated',
          });
        }
      }
    }

    // Determine if this edit approves the intervention
    const wasUnapproved = !currentInvoice.invoiceConfirmed;
    const hasAccordNumber = body.accordNumber || currentInvoice.accordNumber;
    const hasDate = body.dateOfConfirmation || currentInvoice.dateOfConfirmation;
    const nowApproved = hasAccordNumber && hasDate;

    if (wasUnapproved && nowApproved) {
      changeHistoryEntries.push({
        invoiceId: id,
        changedBy: session.user.id,
        fieldName: 'invoiceConfirmed',
        oldValue: 'false',
        newValue: 'true',
        changeType: 'approved',
      });
    }

    // Prepare update data
    const updateData: any = {};
    if ('accordNumber' in body) updateData.accordNumber = body.accordNumber || null;
    if ('dateOfConfirmation' in body) updateData.dateOfConfirmation = body.dateOfConfirmation ? new Date(body.dateOfConfirmation) : null;
    if ('workDescription' in body) updateData.workDescription = body.workDescription;
    if ('didOrderParts' in body) updateData.didOrderParts = body.didOrderParts;
    if ('ordersDetails' in body) updateData.ordersDetails = body.ordersDetails;
    if ('comments' in body) updateData.comments = body.comments;

    // Update approval status
    updateData.invoiceConfirmed = nowApproved;
    updateData.updatedAt = new Date();

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
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

    // Create change history entries
    if (changeHistoryEntries.length > 0) {
      await prisma.changeHistory.createMany({
        data: changeHistoryEntries,
      });
    }

    return NextResponse.json({
      invoice: updatedInvoice,
      changes: changeHistoryEntries.length,
    });
  } catch (error: any) {
    logError('Failed to update invoice', error);
    return NextResponse.json(
      { error: "Échec de la mise à jour de l'intervention" },
      { status: 500 }
    );
  }
}
