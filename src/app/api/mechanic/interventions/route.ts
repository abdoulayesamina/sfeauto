import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/src/lib/prisma'
import { logError } from '@/src/lib/logger'

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
    const uiStatus = searchParams.get('status')

    console.log(
      'Requête reçue avec les paramètres : search=',
      search,
      ' clientId=',
      clientId,
      ' baseId=',
      baseId,
      ' uiStatus=',
      uiStatus
    )

    const whereClause: any = {}

    if (uiStatus && uiStatus !== 'ALL') {
      if (uiStatus === 'EN_COURS') {
        whereClause.inv_status = {
          in: ['CONFIRMED_IN_PLANNING', 'FIXING_STARTED']
        }
      } else if (uiStatus === 'TERMINEE') {
        whereClause.inv_status = 'FIXING_FINISHED'
      } else if (uiStatus === 'ATTENTE_PIECES') {
        whereClause.inv_status = 'WAITING_FOR_PARTS'
      }
    }

    if (baseId) {
      whereClause.inv_vehicle = {
        ...whereClause.inv_vehicle,
        veh_baseId: baseId
      }
    }

    if (clientId) {
      whereClause.inv_vehicle = {
        ...whereClause.inv_vehicle,
        veh_clientId: clientId
      }
    }

    if (search) {
      whereClause.OR = [
        {
          inv_accordNumber: {
            contains: search
          }
        },
        {
          inv_vehicle: {
            veh_licensePlate: {
              contains: search
            }
          }
        }
      ]
    }

    console.log('Affichage de tout les données avant fetch: ', whereClause)

    const interventions = await prisma.invoice_inv.findMany({
      where: whereClause,
      include: {
        inv_vehicle: {
          include: {
            veh_client: {
              select: { cli_id: true, cli_name: true }
            },
            veh_base: {
              select: { bas_id: true, bas_location: true }
            },
            veh_brand: { select: { bra_name: true } },
            veh_model: { select: { mod_name: true } }
          }
        },
        inv_handledBy: {
          select: { usr_name: true, usr_email: true }
        },
        history: {
          include: {
            sth_user: {
              select: { usr_name: true }
            }
          },
          orderBy: {
            sth_changedAt: 'asc'
          }
        }
      },
      orderBy: [
        { inv_status: 'asc' },
        { inv_createdAt: 'desc' }
      ],
      take: 100
    })

    console.log('Interventions récupérées : ', interventions)

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
        brand: inv.inv_vehicle.veh_brand?.bra_name ?? null,
        model: inv.inv_vehicle.veh_model?.mod_name ?? null,
        year: inv.inv_vehicle.veh_year,
        color: inv.inv_vehicle.veh_color,
        client: {
          id: inv.inv_vehicle.veh_client.cli_id,
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
        : null,
      statusHistory: inv.history.map((h) => ({
        id: h.sth_id,
        previousStatus: h.sth_previousStatus,
        newStatus: h.sth_newStatus,
        changedAt: h.sth_changedAt.toISOString(),
        changedBy: h.sth_changedById
      }))
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    logError('ffffFailed to fetch interventions', error)
    return NextResponse.json(
      { error: 'Échec de la récupération des interventions' },
      { status: 500 }
    )
  }
}