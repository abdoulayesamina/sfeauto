import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Only clients can access this endpoint
    if (!session?.user || session.user.role !== 'CLIENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    if (!search?.trim()) {
      return NextResponse.json({ error: 'Recherche requise' }, { status: 400 })
    }

    // Get client's clientId from session (secure JWT signed at login)
    if (!session.user.clientId) {
      return NextResponse.json(
        { error: 'Aucun client associé à cet utilisateur' },
        { status: 403 }
      )
    }

    const searchQuery = search.trim().toUpperCase()

    // Search interventions (client-scoped - only this client's vehicles)
    const interventions = await prisma.invoice.findMany({
      where: {
        vehicle: {
          clientId: session.user.clientId,  // CRITICAL: Only this client's vehicles (from signed JWT)
          licensePlate: {
            contains: searchQuery
          }
        }
      },
      include: {
        vehicle: {
          include: {
            client: {
              select: { name: true }
            },
            base: {
              select: { id: true, location: true }
            }
          }
        },
        handledBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: [
        { status: 'asc' },  // In-progress jobs first
        { createdAt: 'desc' }
      ]
    })

    // Serialize dates for client
    const serialized = interventions.map(inv => ({
      id: inv.id,
      accordNumber: inv.accordNumber,
      dateOfConfirmation: inv.dateOfConfirmation?.toISOString() ?? null,
      invoiceConfirmed: inv.invoiceConfirmed,
      status: inv.status,
      statusUpdatedAt: inv.statusUpdatedAt.toISOString(),
      workDescription: inv.workDescription,
      didOrderParts: inv.didOrderParts,
      ordersDetails: inv.ordersDetails,
      comments: inv.comments,
      createdAt: inv.createdAt.toISOString(),
      vehicle: {
        id: inv.vehicle.id,
        licensePlate: inv.vehicle.licensePlate,
        brand: inv.vehicle.brand,
        model: inv.vehicle.model,
        year: inv.vehicle.year,
        color: inv.vehicle.color,
        client: inv.vehicle.client,
        base: inv.vehicle.base
      },
      handledBy: inv.handledBy
    }))

    return NextResponse.json(serialized)

  } catch (error) {
    logError('Failed to search interventions', error)
    return NextResponse.json(
      { error: 'Échec de la recherche des interventions' },
      { status: 500 }
    )
  }
}
