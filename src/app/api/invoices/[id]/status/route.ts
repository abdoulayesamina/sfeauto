// src/app/api/invoices/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/src/lib/prisma'  // ton import correct
import { WorkStatus } from '@/generated/prisma'
import { logError } from '@/src/lib/logger'

// Validation des transitions de statut
function isValidStatusTransition(
  currentStatus: WorkStatus,
  newStatus: WorkStatus
): boolean {

  const transitions: Record<WorkStatus, WorkStatus[]> = {
    CONFIRMED_IN_PLANNING: [
      'WAITING_FOR_PARTS',
      'FIXING_STARTED',
      'FIXING_FINISHED'
    ],

    WAITING_FOR_PARTS: [
      'CONFIRMED_IN_PLANNING',
      'FIXING_STARTED',
      'FIXING_FINISHED'
    ],

    FIXING_STARTED: [
      'CONFIRMED_IN_PLANNING',
      'WAITING_FOR_PARTS',
      'FIXING_FINISHED'
    ],

    FIXING_FINISHED: [
      'FIXING_STARTED',
      'WAITING_FOR_PARTS',
      'CONFIRMED_IN_PLANNING'
    ],
  }

  if (currentStatus === newStatus) return true

  return transitions[currentStatus]?.includes(newStatus) ?? false
}




export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("[PATCH /status] Called with invoiceId:", id)

    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (session.user.role !== 'MECHANIC' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Seuls les mécaniciens ou admins peuvent modifier le statut' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status: newStatus } = body

    if (!newStatus || !Object.values(WorkStatus).includes(newStatus)) {
      console.error("Dans Valeur de statut invalide")
      return NextResponse.json(
        { error: 'Valeur de statut invalide' },
        { status: 400 }
      )
    }

    // On récupère l'intervention
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            client: { select: { id: true, name: true } },
            base: { select: { id: true, location: true } }
          }
        },
        handledBy: { select: { id: true, name: true } },
        history: { include: { user: { select: { name: true } } }, orderBy: { changedAt: 'asc' } }
        // history: { include: { changedBy: { select: { name: true } } }, orderBy: { changedAt: 'asc' } }
      }
    })

    if (!invoice) {
      console.error("Dans !invoice")
      console.log("[PATCH /status] Invoice not found for id:", id)
      return NextResponse.json(
        { error: `Aucune intervention trouvée avec l'id ${id}` },
        { status: 404 }
      )
    }

    if (!invoice.invoiceConfirmed) {
      console.error("Dans !invoice.invoiceConfirmed")
      return NextResponse.json(
        { error: "Veuillez attribuer un numéro d'accord avant de modifier le statut de cette intervention." },
        { status: 403 }
      )
    }

    if (!isValidStatusTransition(invoice.status, newStatus)) {
      console.error("Dans !isValidStatusTransition(invoice.status, newStatus)")
      console.error(`\n Transition de statut invalide de ${invoice.status} vers ${newStatus}`)
      return NextResponse.json(
        { error: `Transition de statut invalide de ${invoice.status} vers ${newStatus}` },
        { status: 400 }
      )
    }

    const statusChanged = invoice.status !== newStatus

    // Transaction rapide
    await prisma.$transaction(async (tx) => {
      if (statusChanged) {
        await tx.statushistory.create({
          data: {
            invoiceId: id,
            previousStatus: invoice.status,
            newStatus,
            changedById: session.user.id
          }
        })
      }

      await tx.invoice.update({
        where: { id },
        data: {
          status: newStatus,
          statusUpdatedAt: new Date()
        }
      })
    })

    // Fetch mise à jour pour retourner au client
    const updated = await prisma.invoice.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            client: { select: { id: true, name: true } },
            base: { select: { id: true, location: true } }
          }
        },
        handledBy: { select: { id: true, name: true, email: true } },
        history: {
          // include: { changedBy: { select: { name: true } } },
          orderBy: { changedAt: 'asc' }
        }
      }
    })

    if (!updated) {
      console.error("Dans !update")
      return NextResponse.json(
        { error: 'Intervention non trouvée après mise à jour' },
        { status: 404 }
      )
    }

    const serialized = {
      id: updated.id,
      accordNumber: updated.accordNumber,
      dateOfConfirmation: updated.dateOfConfirmation?.toISOString(),
      status: updated.status,
      statusUpdatedAt: updated.statusUpdatedAt.toISOString(),
      workDescription: updated.workDescription,
      didOrderParts: updated.didOrderParts,
      ordersDetails: updated.ordersDetails,
      comments: updated.comments,
      createdAt: updated.createdAt.toISOString(),
      vehicle: {
        id: updated.vehicle.id,
        licensePlate: updated.vehicle.licensePlate,
        brand: updated.vehicle.brandId,
        model: updated.vehicle.modelId,
        year: updated.vehicle.year,
        color: updated.vehicle.color,
        client: updated.vehicle.client,
        base: updated.vehicle.base
      },
      handledBy: updated.handledBy,
      statusHistory: updated.history.map(h => ({
        id: h.id,
        previousStatus: h.previousStatus,
        newStatus: h.newStatus,
        changedAt: h.changedAt.toISOString(),
        changedBy: h.changedById
      }))
    }

    return NextResponse.json(serialized)

  } catch (error: any) {
    logError('Failed to update invoice status', error)
    console.error("[PATCH /status] Error:", error)
    return NextResponse.json(
      { error: 'Erreur serveur inconnue' },
      { status: 500 }
    )
  }
}
