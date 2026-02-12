import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { auth } from "@/auth"
import { getSasUrlForBlob } from "@/src/lib/azureBlob"

export const runtime = "nodejs"

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id: invoiceId } = await ctx.params

    if (!invoiceId || invoiceId === "undefined" || invoiceId === "null") {
      return NextResponse.json({ error: "invoiceId invalide" }, { status: 400 })
    }

    // Optionnel : s'assurer que l'intervention existe
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true },
    })
    if (!invoice) {
      return NextResponse.json({ error: "Intervention introuvable" }, { status: 404 })
    }

    const photos = await prisma.invoicephoto.findMany({
      where: { invoiceId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        blobName: true,
        url: true,
        contentType: true,
        size: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      photos: photos.map((p) => ({
        ...p,
        sasUrl: getSasUrlForBlob(p.blobName),
      })),
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    )
  }
}
