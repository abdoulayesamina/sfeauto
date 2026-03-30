import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/src/lib/prisma'
import { logError } from '@/src/lib/logger'

// GET all bases
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN' && session.user.role !== 'MECHANIC') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const bases = await prisma.base_bas.findMany({
      include: {
        bas_client: {
          select: { cli_name: true }
        },
        _count: {
          select: {
            vehicles: true
          }
        }
      },
      orderBy: [
        { bas_client: { cli_name: 'asc' } },
        { bas_location: 'asc' }
      ]
    })

    return NextResponse.json(bases)
  } catch (error) {
    logError('Failed to fetch bases', error)
    return NextResponse.json({ error: 'Échec de la récupération des agences' }, { status: 500 })
  }
}

// POST create new base
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const body = await request.json()
    const { bas_clientId : clientId, bas_location : location } = body

    if (!clientId || !location?.trim()) {
      return NextResponse.json({ error: 'Client et localisation requis' }, { status: 400 })
    }

    // Verify client exists
    const clientExists = await prisma.client_cli.findUnique({
      where: { cli_id: clientId },
    });
    if (!clientExists) {
      return NextResponse.json({ error: 'Client invalide' }, { status: 400 });
    }

    const base = await prisma.base_bas.create({
      data: {
        bas_clientId : clientId,
        bas_location: location.trim()
      },
      include: {
        bas_client: {
          select: { cli_name: true }
        },
        _count: {
          select: {
            vehicles: true
          }
        }
      }
    })

    return NextResponse.json(base, { status: 201 })
  } catch (error) {
    logError('Failed to create base', error)
    return NextResponse.json({ error: 'Échec de la création de l\'agence' }, { status: 500 })
  }
}
