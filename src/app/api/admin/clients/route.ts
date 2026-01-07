import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/src/lib/prisma'
import { logError } from '@/src/lib/logger'

// GET all clients
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: {
            bases: true,
            vehicles: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(clients)
  } catch (error) {
    logError('Failed to fetch clients', error)
    return NextResponse.json({ error: 'Échec de la récupération des clients' }, { status: 500 })
  }
}

// POST create new client
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const body = await request.json()
    const { name } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nom du client requis' }, { status: 400 })
    }

    // Check if client name already exists
    // Note: SQLite doesn't support case-insensitive mode
    // This will be case-sensitive in dev (SQLite), case-insensitive in prod (PostgreSQL with mode)
    const existingClient = await prisma.client.findFirst({
      where: {
        name: name.trim()
      }
    })

    if (existingClient) {
      return NextResponse.json({ error: 'Ce nom de client existe déjà' }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        name: name.trim()
      },
      include: {
        _count: {
          select: {
            bases: true,
            vehicles: true
          }
        }
      }
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    logError('Failed to create client', error)
    return NextResponse.json({ error: 'Échec de la création du client' }, { status: 500 })
  }
}
