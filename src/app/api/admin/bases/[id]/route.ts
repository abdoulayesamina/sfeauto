import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/src/lib/prisma'
import { logError } from '@/src/lib/logger'

// PUT update base
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { bas_clientId : clientId, bas_location : location } = body

    if (!clientId || !location?.trim()) {
      return NextResponse.json({ error: 'Client et localisation requis' }, { status: 400 })
    }

    const base = await prisma.base_bas.update({
      where: { bas_id : id },
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

    return NextResponse.json(base)
  } catch (error) {
    logError('Failed to update base', error)
    return NextResponse.json({ error: 'Échec de la mise à jour de l\'agence' }, { status: 500 })
  }
}

// DELETE base
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const { id } = await params

    // Check if base has vehicles
    const base = await prisma.base_bas.findUnique({
      where: { bas_id : id },
      include: {
        _count: {
          select: {
            vehicles: true
          }
        }
      }
    })

    if (!base) {
      return NextResponse.json({ error: 'Agence non trouvée' }, { status: 404 })
    }

    if (base._count.vehicles > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer une agence avec ${base._count.vehicles} véhicule(s)` },
        { status: 400 }
      )
    }

    await prisma.base_bas.delete({
      where: { bas_id : id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Failed to delete base', error)
    return NextResponse.json({ error: 'Échec de la suppression de l\'agence' }, { status: 500 })
  }
}
