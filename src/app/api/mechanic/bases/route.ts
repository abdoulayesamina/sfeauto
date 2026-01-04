import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'

// GET /api/mechanic/bases - Get all bases for filter dropdown (optionally filtered by clientId)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Only mechanics and admins can access this endpoint
    if (!session?.user || (session.user.role !== 'MECHANIC' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId')

    const bases = await prisma.base.findMany({
      where: clientId ? { clientId } : undefined,
      select: {
        id: true,
        location: true,
        client: {
          select: {
            id: true,
            name: true
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
    return NextResponse.json(
      { error: 'Échec de la récupération des agences' },
      { status: 500 }
    )
  }
}
