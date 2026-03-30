import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/src/lib/prisma'
import { logError } from '@/src/lib/logger'

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

    if (!session.user.clientId) {
      return NextResponse.json(
        { error: 'Aucun client associé à cet utilisateur' },
        { status: 403 }
      )
    }

    const searchQuery = search.trim().toUpperCase()

    const interventions = await prisma.invoice_inv.findMany({
      where: {
        inv_vehicle: {
          veh_clientId: session.user.clientId,
          veh_licensePlate: {
            contains: searchQuery
          }
        }
      },
      include: {
        inv_vehicle: {
          include: {
            veh_client: {
              select: { cli_name: true }
            },
            veh_base: {
              select: { bas_id: true, bas_location: true }
            }
          }
        },
        inv_handledBy: {
          select: { usr_name: true, usr_email: true }
        }
      },
      orderBy: [
        { inv_status: 'asc' },
        { inv_createdAt: 'desc' }
      ]
    })

    const serialized = interventions.map((inv) => ({
      id: inv.inv_id,
      accordNumber: inv.inv_accordNumber,
      dateOfConfirmation: inv.inv_dateOfConfirmation?.toISOString() ?? null,
      invoiceConfirmed: inv.inv_invoiceConfirmed,
      status: inv.inv_status,
      statusUpdatedAt: inv.inv_statusUpdatedAt.toISOString(),
      workDescription: inv.inv_workDescription,
      didOrderParts: inv.inv_didOrderParts,
      ordersDetails: inv.inv_ordersDetails,
      comments: inv.inv_comments,
      createdAt: inv.inv_createdAt.toISOString(),
      vehicle: {
        id: inv.inv_vehicle.veh_id,
        licensePlate: inv.inv_vehicle.veh_licensePlate,
        brandId: inv.inv_vehicle.veh_brandId,
        modelId: inv.inv_vehicle.veh_modelId,
        year: inv.inv_vehicle.veh_year,
        color: inv.inv_vehicle.veh_color,
        client: {
          name: inv.inv_vehicle.veh_client.cli_name
        },
        base: {
          id: inv.inv_vehicle.veh_base.bas_id,
          location: inv.inv_vehicle.veh_base.bas_location
        }
      },
      handledBy: inv.inv_handledBy
        ? {
            name: inv.inv_handledBy.usr_name,
            email: inv.inv_handledBy.usr_email
          }
        : null
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