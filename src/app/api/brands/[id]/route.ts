import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const vehiclesCount = await prisma.vehicle_veh.count({
      where: { veh_brandId: id },
    })

    if (vehiclesCount > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer : marque utilisée par des véhicules" },
        { status: 400 }
      )
    }

    await prisma.brand_bra.delete({
      where: { bra_id: id },
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
    const brand = await prisma.brand_bra.update({
      where: { bra_id: id },
      data: { bra_name: name },
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = await params.then((p) => p.id)

  try {
    const brand = await prisma.brand_bra.findUnique({
      where: { bra_id: id },
    })

    if (!brand) {
      return NextResponse.json(
        { error: "Marque introuvable" },
        { status: 404 }
      )
    }

    return NextResponse.json(brand)
  } catch (e) {
    console.error("GET /api/brands/[id] error:", e)
    return NextResponse.json(
      { error: "Erreur récupération marque" },
      { status: 500 }
    )
  }
}