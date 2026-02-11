import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"


export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Sécurité : vérifier si le modèle est utilisé par des véhicules
    const vehiclesCount = await prisma.vehicle.count({
      where: { modelId: id },
    })

    if (vehiclesCount > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer : modèle utilisé par des véhicules" },
        { status: 400 }
      )
    }

    await prisma.model.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("DELETE /api/models error:", e)
    return NextResponse.json(
      { error: "Erreur suppression modèle" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { name } = await req.json()

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Nom invalide" },
      { status: 400 }
    )
  }

  try {
    const model = await prisma.model.update({
      where: { id },
      data: { name },
    })

    return NextResponse.json(model)
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "Ce modèle existe déjà pour cette marque" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Erreur modification modèle" },
      { status: 500 }
    )
  }
}
