import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/src/lib/prisma'
import { WorkStatus } from '@/generated/prisma'
import { logError } from '@/src/lib/logger'

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
    console.log('[PATCH /status] Called with invoiceId:', id)

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
      return NextResponse.json(
        { error: 'Valeur de statut invalide' },
        { status: 400 }
      )
    }

    const invoice = await prisma.invoice_inv.findUnique({
      where: { inv_id: id },
      include: {
        inv_vehicle: {
          include: {
            veh_client: { select: { cli_id: true, cli_name: true } },
            veh_base: { select: { bas_id: true, bas_location: true } }
          }
        },
        inv_handledBy: { select: { usr_id: true, usr_name: true } },
        history: {
          include: {
            sth_user: { select: { usr_name: true } }
          },
          orderBy: { sth_changedAt: 'asc' }
        }
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: `Aucune intervention trouvée avec l'id ${id}` },
        { status: 404 }
      )
    }

    if (!invoice.inv_accordNumber) {
      return NextResponse.json(
        { error: "Veuillez attribuer un numéro d'accord avant de modifier le statut de cette intervention." },
        { status: 403 }
      )
    }

    if (!isValidStatusTransition(invoice.inv_status as WorkStatus, newStatus)) {
      return NextResponse.json(
        { error: `Transition de statut invalide de ${invoice.inv_status} vers ${newStatus}` },
        { status: 400 }
      )
    }

    const statusChanged = invoice.inv_status !== newStatus

    await prisma.$transaction(async (tx) => {
      if (statusChanged) {
        await tx.statushistory_sth.create({
          data: {
            sth_invoiceId: id,
            sth_previousStatus: invoice.inv_status,
            sth_newStatus: newStatus,
            sth_changedById: session.user.id
          }
        })
      }

      await tx.invoice_inv.update({
        where: { inv_id: id },
        data: {
          inv_status: newStatus,
          inv_statusUpdatedAt: new Date()
        }
      })
    })

    const updated = await prisma.invoice_inv.findUnique({
      where: { inv_id: id },
      include: {
        inv_vehicle: {
          include: {
            veh_client: { select: { cli_id: true, cli_name: true } },
            veh_base: { select: { bas_id: true, bas_location: true } }
          }
        },
        inv_handledBy: { select: { usr_id: true, usr_name: true, usr_email: true } },
        history: {
          include: {
            sth_user: { select: { usr_name: true } }
          },
          orderBy: { sth_changedAt: 'asc' }
        }
      }
    })

    if (!updated) {
      return NextResponse.json(
        { error: 'Intervention non trouvée après mise à jour' },
        { status: 404 }
      )
    }

    const serialized = {
      id: updated.inv_id,
      accordNumber: updated.inv_accordNumber,
      dateOfConfirmation: updated.inv_dateOfConfirmation?.toISOString(),
      status: updated.inv_status,
      statusUpdatedAt: updated.inv_statusUpdatedAt.toISOString(),
      workDescription: updated.inv_workDescription,
      didOrderParts: updated.inv_didOrderParts,
      ordersDetails: updated.inv_ordersDetails,
      comments: updated.inv_comments,
      createdAt: updated.inv_createdAt.toISOString(),
      vehicle: updated.inv_vehicle
        ? {
            id: updated.inv_vehicle.veh_id,
            licensePlate: updated.inv_vehicle.veh_licensePlate,
            brand: updated.inv_vehicle.veh_brandId,
            model: updated.inv_vehicle.veh_modelId,
            year: updated.inv_vehicle.veh_year,
            color: updated.inv_vehicle.veh_color,
            client: updated.inv_vehicle.veh_client
              ? {
                  id: updated.inv_vehicle.veh_client.cli_id,
                  name: updated.inv_vehicle.veh_client.cli_name,
                }
              : null,
            base: updated.inv_vehicle.veh_base
              ? {
                  id: updated.inv_vehicle.veh_base.bas_id,
                  location: updated.inv_vehicle.veh_base.bas_location,
                }
              : null,
          }
        : null,
      handledBy: updated.inv_handledBy
        ? {
            id: updated.inv_handledBy.usr_id,
            name: updated.inv_handledBy.usr_name,
            email: updated.inv_handledBy.usr_email,
          }
        : null,
      statusHistory: updated.history.map((h) => ({
        id: h.sth_id,
        previousStatus: h.sth_previousStatus,
        newStatus: h.sth_newStatus,
        changedAt: h.sth_changedAt.toISOString(),
        changedBy: h.sth_changedById,
        changedByUser: h.sth_user
          ? {
              name: h.sth_user.usr_name,
            }
          : null,
      }))
    }

    return NextResponse.json(serialized)
  } catch (error: any) {
    logError('Failed to update invoice status', error)
    console.error('[PATCH /status] Error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur inconnue' },
      { status: 500 }
    )
  }
}