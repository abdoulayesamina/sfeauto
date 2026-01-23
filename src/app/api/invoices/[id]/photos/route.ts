// app/api/invoices/[id]/photos/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { auth } from "@/auth"
import { randomUUID } from "crypto"
import { getContainerClient, getSasUrlForBlob } from "@/src/lib/azureBlob"

export const runtime = "nodejs"

const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB
const ALLOWED_PREFIX = "image/"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== "MANAGER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const invoiceId = params.id

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, select: { id: true } })
  if (!invoice) return NextResponse.json({ error: "Intervention introuvable" }, { status: 404 })

  const form = await req.formData()
  const files = (form.getAll("photos") as File[]) ?? []

  if (!files.length) {
    return NextResponse.json({ error: "Aucune photo reçue (champ 'photos')" }, { status: 400 })
  }

  const container = getContainerClient()
  await container.createIfNotExists()

  const createdRows: any[] = []

  for (const file of files) {
    if (!(file instanceof File)) continue

    if (!file.type?.startsWith(ALLOWED_PREFIX)) {
      return NextResponse.json({ error: `Type non supporté: ${file.type}` }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `Fichier trop lourd: ${file.name}` }, { status: 400 })
    }

    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg"
    const blobName = `invoice/${invoiceId}/${randomUUID()}.${ext}`

    const blockBlob = container.getBlockBlobClient(blobName)
    const buffer = Buffer.from(await file.arrayBuffer())

    await blockBlob.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: file.type },
    })

    const row = await prisma.invoicePhoto.create({
      data: {
        invoiceId,
        blobName,
        url: blockBlob.url,
        contentType: file.type,
        size: file.size,
        uploadedById: session.user.id,
      },
    })

    createdRows.push({ ...row, sasUrl: getSasUrlForBlob(blobName) })
  }

  return NextResponse.json({ photos: createdRows }, { status: 201 })
}
