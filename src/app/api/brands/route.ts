import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { randomUUID } from "crypto"

export async function GET() {
  const brands = await prisma.brand_bra.findMany({
    orderBy: { bra_name: "asc" },
  })

  return NextResponse.json(
    brands.map((brand) => ({
      id: brand.bra_id,
      name: brand.bra_name,
      createdAt: brand.bra_createdAt,
      updatedAt: brand.bra_updatedAt,
    }))
  )
}

export async function POST(req: Request) {
  const { name } = await req.json()

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Nom de marque requis" },
      { status: 400 }
    )
  }

  try {
    const brand = await prisma.brand_bra.create({
      data: {
        bra_id: randomUUID(),
        bra_name: name,
      },
    })

    return NextResponse.json(
      {
        id: brand.bra_id,
        name: brand.bra_name,
        createdAt: brand.bra_createdAt,
        updatedAt: brand.bra_updatedAt,
      },
      { status: 201 }
    )
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json(
        { error: "Cette marque existe déjà" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Erreur création marque" },
      { status: 500 }
    )
  }
}