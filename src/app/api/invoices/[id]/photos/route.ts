import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { auth } from "@/auth"
// import { getSasUrlForBlob } from "@/src/lib/azureBlob"
import { randomUUID } from "crypto"
import { getContainerClient, getSasUrlForBlob } from "@/src/lib/azureBlob"
import { logError } from "@/src/lib/logger"



export const runtime = "nodejs"

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || !["MANAGER", "MECHANIC", "CLIENT","AGENCE","ADMIN"].includes(session.user.role)) {
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

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const role = session?.user?.role

    if (!session || !["MANAGER", "AGENCE", "ADMIN","MECHANIC"].includes(role as string)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id: invoiceId } = await ctx.params

    if (!invoiceId || invoiceId === "undefined" || invoiceId === "null") {
      return NextResponse.json({ error: "invoiceId invalide" }, { status: 400 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Intervention introuvable" }, { status: 404 })
    }

    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Utilisez multipart/form-data" },
        { status: 400 }
      )
    }

    const form = await request.formData()
    const files = (form.getAll("files") as File[]) ?? []

    if (!files.length) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 })
    }

    const container = getContainerClient()
    await container.createIfNotExists()

    const createdPhotos: any[] = []

    for (const file of files) {
      if (!(file instanceof File)) continue

      if (!file.type?.startsWith("image/")) {
        return NextResponse.json({ error: "Type non supporté" }, { status: 400 })
      }

      if (file.size > 8 * 1024 * 1024) {
        return NextResponse.json({ error: "Fichier trop lourd (8MB max)" }, { status: 400 })
      }

      const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg"
      const blobName = `invoice/${invoiceId}/${randomUUID()}.${ext}`

      const blockBlob = container.getBlockBlobClient(blobName)
      const buffer = Buffer.from(await file.arrayBuffer())

      await blockBlob.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: file.type || "application/octet-stream",
        },
      })

      const row = await prisma.invoicephoto.create({
        data: {
          invoiceId,
          blobName,
          url: blockBlob.url,
          contentType: file.type || null,
          size: file.size,
          uploadedById: session.user.id,
        },
      })

      createdPhotos.push({
        ...row,
        sasUrl: getSasUrlForBlob(blobName),
      })
    }

    return NextResponse.json({ photos: createdPhotos }, { status: 201 })
  } catch (error: any) {
    logError("Failed to upload photos (edit)", error)
    return NextResponse.json(
      { error: "Erreur upload photos" },
      { status: 500 }
    )
  }
}
