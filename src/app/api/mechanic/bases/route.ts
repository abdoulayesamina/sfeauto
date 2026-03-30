import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/src/lib/prisma'
import { logError } from '@/src/lib/logger'

// GET /api/mechanic/bases - Get all bases for filter dropdown (optionally filtered by clientId)
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || (session.user.role !== 'MECHANIC' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get('clientId')

    const bases = await prisma.base_bas.findMany({
      where: clientId ? { bas_clientId: clientId } : undefined,
      select: {
        bas_id: true,
        bas_location: true,
        bas_client: {
          select: {
            cli_id: true,
            cli_name: true
          }
        }
      },
      orderBy: [
        { bas_client: { cli_name: 'asc' } },
        { bas_location: 'asc' }
      ]
    })

    const formattedBases = bases.map((base) => ({
      id: base.bas_id,
      location: base.bas_location,
      client: base.bas_client
        ? {
            id: base.bas_client.cli_id,
            name: base.bas_client.cli_name
          }
        : null
    }))

    return NextResponse.json(formattedBases)
  } catch (error) {
    logError('Failed to fetch bases', error)
    return NextResponse.json(
      { error: 'Échec de la récupération des agences' },
      { status: 500 }
    )
  }
}