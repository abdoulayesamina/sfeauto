import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'

// GET all bases
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const bases = await prisma.base.findMany({
      include: {
        client: {
          select: { name: true }
        },
        _count: {
          select: {
            vehicles: true
          }
        }
      },
      orderBy: [
        { client: { name: 'asc' } },
        { location: 'asc' }
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
    const { clientId, location } = body

    if (!clientId || !location?.trim()) {
      return NextResponse.json({ error: 'Client et localisation requis' }, { status: 400 })
    }

    // Verify client exists
    const clientExists = await prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!clientExists) {
      return NextResponse.json({ error: 'Client invalide' }, { status: 400 });
    }

    const base = await prisma.base.create({
      data: {
        clientId,
        location: location.trim()
      },
      include: {
        client: {
          select: { name: true }
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
