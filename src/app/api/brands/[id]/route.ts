import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const vehiclesCount = await prisma.vehicle.count({
      where: { brandId: id },
    })

    if (vehiclesCount > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer : marque utilisée par des véhicules" },
        { status: 400 }
      )
    }

    await prisma.brand.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error("DELETE /api/brands/[id] error:", e)
    return NextResponse.json(
      { error: "Erreur suppression marque" },
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
    const brand = await prisma.brand.update({
      where: { id },
      data: { name },
    })

    return NextResponse.json(brand)
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "Cette marque existe déjà" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Erreur modification marque" },
      { status: 500 }
    )
  }
}
