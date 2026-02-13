import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { auth } from "@/auth"
import { getContainerClient } from "@/src/lib/azureBlob"

export const runtime = "nodejs"

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await ctx.params

    if (!id) {
      return NextResponse.json({ error: "Photo id manquant" }, { status: 400 })
    }

    // 1️⃣ Récupérer la photo
    const photo = await prisma.invoicephoto.findUnique({
      where: { id },
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo introuvable" }, { status: 404 })
    }

    // 2️⃣ Supprimer le blob Azure
    const container = getContainerClient()
    const blobClient = container.getBlockBlobClient(photo.blobName)

    await blobClient.deleteIfExists()

    // 3️⃣ Supprimer en base
    await prisma.invoicephoto.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erreur suppression photo" },
      { status: 500 }
    )
  }
}
