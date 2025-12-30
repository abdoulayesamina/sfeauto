import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { logError } from '@/lib/logger'

// PUT update client
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
    const { name } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Nom du client requis' }, { status: 400 })
    }

    // Check if client name already exists (excluding current client)
    // Note: SQLite doesn't support case-insensitive mode
    const existingClient = await prisma.client.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    })

    if (existingClient) {
      return NextResponse.json({ error: 'Ce nom de client existe déjà' }, { status: 400 })
    }

    const client = await prisma.client.update({
      where: { id },
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

    return NextResponse.json(client)
  } catch (error) {
    logError('Failed to update client', error)
    return NextResponse.json({ error: 'Échec de la mise à jour du client' }, { status: 500 })
  }
}

// DELETE client
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

    // Check if client has bases or vehicles
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bases: true,
            vehicles: true
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json({ error: 'Client non trouvé' }, { status: 404 })
    }

    if (client._count.bases > 0 || client._count.vehicles > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer un client avec ${client._count.bases} agence(s) et ${client._count.vehicles} véhicule(s)` },
        { status: 400 }
      )
    }

    await prisma.client.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logError('Failed to delete client', error)
    return NextResponse.json({ error: 'Échec de la suppression du client' }, { status: 500 })
  }
}
