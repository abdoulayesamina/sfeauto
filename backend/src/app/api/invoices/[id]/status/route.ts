import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { WorkStatus } from '@prisma/client'
import { logError } from '@/lib/logger'

// Status transition validation
function isValidStatusTransition(currentStatus: WorkStatus, newStatus: WorkStatus): boolean {
  const forward: Record<WorkStatus, WorkStatus[]> = {
    CONFIRMED_IN_PLANNING: ['WAITING_FOR_PARTS', 'FIXING_STARTED', 'FIXING_FINISHED'],
    WAITING_FOR_PARTS: ['FIXING_STARTED', 'FIXING_FINISHED'],
    FIXING_STARTED: ['FIXING_FINISHED', 'WAITING_FOR_PARTS'],
    FIXING_FINISHED: []
  }

  // Allow staying at same status
  if (currentStatus === newStatus) return true

  return forward[currentStatus]?.includes(newStatus) || false
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Only mechanics and admins can update status
    if (session.user.role !== 'MECHANIC' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Seuls les mécaniciens peuvent modifier le statut des travaux' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status: newStatus } = body

    if (!newStatus || !Object.values(WorkStatus).includes(newStatus)) {
      return NextResponse.json(
        { error: 'Valeur de statut invalide' },
        { status: 400 }
      )
    }

    // Get current invoice
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            base: {
              select: { location: true }
            }
          }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      )
    }

    // Block status updates for unapproved interventions
    if (!invoice.invoiceConfirmed) {
      return NextResponse.json(
        { error: 'Impossible de modifier le statut d\'une intervention non approuvée' },
        { status: 403 }
      )
    }

    // Validate status transition
    if (!isValidStatusTransition(invoice.status, newStatus)) {
      return NextResponse.json(
        { error: `Transition de statut invalide de ${invoice.status} vers ${newStatus}` },
        { status: 400 }
      )
    }

    // Only create history if status actually changed
    const statusChanged = invoice.status !== newStatus

    // Fast write-only transaction - minimal lock time for better concurrency
    await prisma.$transaction(async (tx) => {
      // Create status history record (if status changed)
      if (statusChanged) {
        await tx.statusHistory.create({
          data: {
            invoiceId: id,
            previousStatus: invoice.status,
            newStatus: newStatus,
            changedById: session.user.id
          }
        })
      }

      // Update invoice status (no includes to keep transaction fast)
      await tx.invoice.update({
        where: { id },
        data: {
          status: newStatus,
          statusUpdatedAt: new Date()
        }
      })
    })

    // Fetch updated invoice with all relations OUTSIDE transaction
    // This keeps transaction lock time minimal and improves performance
    const updated = await prisma.invoice.findUnique({
      where: { id },
      include: {
        vehicle: {
          include: {
            client: {
              select: { id: true, name: true }
            },
            base: {
              select: { id: true, location: true }
            }
          }
        },
        handledBy: {
          select: { name: true, email: true }
        },
        statusHistory: {
          include: {
            changedBy: {
              select: { name: true }
            }
          },
          orderBy: {
            changedAt: 'asc'
          }
        }
      }
    })

    if (!updated) {
      return NextResponse.json(
        { error: 'Intervention non trouvée après mise à jour' },
        { status: 404 }
      )
    }

    // Serialize for client (no extra fetch needed!)
    const serialized = {
      id: updated.id,
      accordNumber: updated.accordNumber!,
      dateOfConfirmation: updated.dateOfConfirmation!.toISOString(),
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
        brand: updated.vehicle.brand,
        model: updated.vehicle.model,
        year: updated.vehicle.year,
        color: updated.vehicle.color,
        client: updated.vehicle.client,
        base: updated.vehicle.base
      },
      handledBy: updated.handledBy,
      statusHistory: updated.statusHistory.map(h => ({
        id: h.id,
        previousStatus: h.previousStatus,
        newStatus: h.newStatus,
        changedAt: h.changedAt.toISOString(),
        changedBy: h.changedBy
      }))
    }

    return NextResponse.json(serialized)

  } catch (error) {
    logError('Failed to update invoice status', error)
    return NextResponse.json(
      { error: 'Échec de la mise à jour du statut' },
      { status: 500 }
    )
  }
}
