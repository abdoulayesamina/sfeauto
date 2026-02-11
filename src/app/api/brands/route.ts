import { NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { randomUUID } from "crypto"

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  })

  return NextResponse.json(brands)
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
    const brand = await prisma.brand.create({
      data: {
        id: randomUUID(), // 🔥 obligatoire car pas de default dans Prisma
        name,
      },
    })

    return NextResponse.json(brand, { status: 201 })
  } catch (e: any) {
    // Cas nom déjà existant (unique)
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

