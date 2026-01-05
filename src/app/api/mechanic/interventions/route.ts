import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Only mechanics and admins can access this endpoint
    if (!session?.user || (session.user.role !== 'MECHANIC' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')?.trim().toUpperCase()
    const clientId = searchParams.get('clientId')
    const baseId = searchParams.get('baseId')

    // Build where clause for filters
    const whereClause: any = {}

    // Filter by base
    if (baseId) {
      whereClause.vehicle = {
        ...whereClause.vehicle,
        baseId
      }
    }

    // Filter by client
    if (clientId) {
      whereClause.vehicle = {
        ...whereClause.vehicle,
        clientId
      }
    }

    // Search by accord number or license plate (optional)
    if (search) {
      whereClause.OR = [
        {
          accordNumber: {
            contains: search
          }
        },
        {
          vehicle: {
            licensePlate: {
              contains: search
            }
          }
        }
      ]
    }

    const interventions = await prisma.invoice.findMany({
      where: whereClause,
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
      },
      orderBy: [
        { status: 'asc' },  // In-progress jobs first
        { createdAt: 'desc' }
      ],
      take: 50  // Limit results for performance
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
      handledBy: inv.handledBy,
      statusHistory: inv.statusHistory.map(h => ({
        id: h.id,
        previousStatus: h.previousStatus,
        newStatus: h.newStatus,
        changedAt: h.changedAt.toISOString(),
        changedBy: h.changedBy
      }))
    }))

    return NextResponse.json(serialized)

  } catch (error) {
    logError('Failed to fetch interventions', error)
    return NextResponse.json(
      { error: 'Échec de la récupération des interventions' },
      { status: 500 }
    )
  }
}
