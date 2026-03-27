import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { randomUUID } from "crypto"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const brandId = searchParams.get("brandId")

    if (!brandId) {
      return NextResponse.json([], { status: 200 })
    }

    const models = await prisma.model_mod.findMany({
      where: { mod_brandId: brandId },
      orderBy: { mod_name: "asc" },
    })

    return NextResponse.json(
      models.map((model) => ({
        id: model.mod_id,
        name: model.mod_name,
        brandId: model.mod_brandId,
        createdAt: model.mod_createdAt,
        updatedAt: model.mod_updatedAt,
      }))
    )
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

    const model = await prisma.model_mod.create({
      data: {
        mod_id: randomUUID(),
        mod_name: name,
        mod_brandId: brandId,
      },
    })

    return NextResponse.json(
      {
        id: model.mod_id,
        name: model.mod_name,
        brandId: model.mod_brandId,
        createdAt: model.mod_createdAt,
        updatedAt: model.mod_updatedAt,
      },
      { status: 201 }
    )
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