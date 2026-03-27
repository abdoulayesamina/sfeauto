import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const vehiclesCount = await prisma.vehicle_veh.count({
      where: { veh_modelId: id },
    })

    if (vehiclesCount > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer : modèle utilisé par des véhicules" },
        { status: 400 }
      )
    }

    await prisma.model_mod.delete({
      where: { mod_id: id },
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
    const model = await prisma.model_mod.update({
      where: { mod_id: id },
      data: { mod_name: name },
    })

    return NextResponse.json({
      id: model.mod_id,
      name: model.mod_name,
      brandId: model.mod_brandId,
      createdAt: model.mod_createdAt,
      updatedAt: model.mod_updatedAt,
    })
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = await params.then((p) => p.id)

  try {
    const model = await prisma.model_mod.findUnique({
      where: { mod_id: id },
    })

    if (!model) {
      return NextResponse.json(
        { error: "Modèle introuvable" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: model.mod_id,
      name: model.mod_name,
      brandId: model.mod_brandId,
      createdAt: model.mod_createdAt,
      updatedAt: model.mod_updatedAt,
    })
  } catch (e) {
    console.error("GET /api/models/[id] error:", e)
    return NextResponse.json(
      { error: "Erreur récupération modèle" },
      { status: 500 }
    )
  }
}