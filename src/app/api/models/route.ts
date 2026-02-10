import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { randomUUID } from "crypto"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const brandId = searchParams.get("brandId")

    if (!brandId) {
      // IMPORTANT : toujours retourner du JSON
      return NextResponse.json([], { status: 200 })
    }

    const models = await prisma.model.findMany({
      where: { brandId },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(models)
  } catch (e) {
    console.error("GET /api/models error:", e)
    return NextResponse.json(
      { error: "Erreur récupération modèles" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { name, brandId } = await req.json()

    if (!name || !brandId) {
      return NextResponse.json(
        { error: "Nom et brandId requis" },
        { status: 400 }
      )
    }

    const model = await prisma.model.create({
      data: {
        id: randomUUID(), // 🔥 obligatoire
        name,
        brandId,
      },
    })

    return NextResponse.json(model, { status: 201 })
  } catch (e: any) {
    console.error("POST /api/models error:", e)

    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "Ce modèle existe déjà pour cette marque" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Erreur création modèle" },
      { status: 500 }
    )
  }
}
