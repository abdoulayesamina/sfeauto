import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/src/lib/prisma'
import { logError } from '@/src/lib/logger'

// GET /api/mechanic/clients - Get all clients for filter dropdown
export async function GET() {
  try {
    const session = await auth()

    // Only mechanics and admins can access this endpoint
    if (!session?.user || (session.user.role !== 'MECHANIC' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const clients = await prisma.client_cli.findMany({
      select: {
        cli_id: true,
        cli_name: true
      },
      orderBy: {
        cli_name: 'asc'
      }
    })

    const formattedClients = clients.map((client) => ({
      id: client.cli_id,
      name: client.cli_name
    }))

    return NextResponse.json(formattedClients)
  } catch (error) {
    logError('Failed to fetch clients', error)
    return NextResponse.json(
      { error: 'Échec de la récupération des clients' },
      { status: 500 }
    )
  }
}