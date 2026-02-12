import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { auth } from "@/auth"
import { logError } from "@/src/lib/logger"
import { randomUUID } from "crypto"
import { getContainerClient, getSasUrlForBlob } from "@/src/lib/azureBlob"

export const runtime = "nodejs"

const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB
const ALLOWED_PREFIX = "image/"

function asString(v: FormDataEntryValue | null): string | null {
  if (!v) return null
  return typeof v === "string" ? v : null
}
function asBool(v: FormDataEntryValue | null): boolean {
  const s = asString(v)
  if (!s) return false
  return ["true", "1", "yes", "oui", "on"].includes(s.toLowerCase())
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // ✅ Autoriser MANAGER + AGENCE (et ADMIN si tu veux)
    const role = session?.user?.role
    if (!session || !["MANAGER", "AGENCE", "ADMIN"].includes(role as string)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const contentType = request.headers.get("content-type") || ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Format invalide : utilisez multipart/form-data (FormData) pour envoyer l’intervention + photos." },
        { status: 400 }
      )
    }

    const form = await request.formData()

    const vehicleId = asString(form.get("vehicleId"))
    const accordNumber = asString(form.get("accordNumber"))
    const dateOfConfirmation = asString(form.get("dateOfConfirmation"))
    const workDescription = asString(form.get("workDescription"))
    const didOrderParts = asBool(form.get("didOrderParts"))
    const ordersDetails = asString(form.get("ordersDetails"))
    const comments = asString(form.get("comments"))

    const files = (form.getAll("photos") as File[]) ?? []

    // Validate required fields
    if (!vehicleId) {
      return NextResponse.json({ error: "L'identifiant du véhicule est requis" }, { status: 400 })
    }

    // ✅ Vérifier que le véhicule existe + récupérer sa base
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, baseId: true },
    })

    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule invalide" }, { status: 400 })
    }

    // ✅ Sécurité AGENCE : ne peut créer que pour SA base
    if (role === "AGENCE") {
      const userBaseId = session.user.baseId // supposé présent sur session.user
      if (!userBaseId) {
        return NextResponse.json({ error: "Compte agence sans baseId" }, { status: 403 })
      }
      if (vehicle.baseId !== userBaseId) {
        return NextResponse.json({ error: "Vous ne pouvez pas créer d’intervention pour une autre agence" }, { status: 403 })
      }
    }

    // Calcul correct de invoiceConfirmed (Boolean)
    const hasAccordNumber = accordNumber && accordNumber.trim().length > 0

    // Pour le moment tu forces true
    const invoiceConfirmed = true

    // Validate dateOfConfirmation (si fournie)
    if (dateOfConfirmation) {
      const confirmationDate = new Date(dateOfConfirmation)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (confirmationDate > today) {
        return NextResponse.json({ error: "La date de confirmation ne peut pas être dans le futur" }, { status: 400 })
      }
    }

    // Validate files (si fournis)
    for (const f of files) {
      if (!(f instanceof File)) continue
      if (!f.type?.startsWith(ALLOWED_PREFIX)) {
        return NextResponse.json({ error: `Type non supporté: ${f.type || "unknown"}` }, { status: 400 })
      }
      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: `Fichier trop lourd: ${f.name}` }, { status: 400 })
      }
    }

    const container = getContainerClient()
    await container.createIfNotExists()

    const uploadedBlobNames: string[] = []

    try {
      const result = await prisma.$transaction(async (tx) => {
        // 1) Création de l'invoice
        const invoice = await tx.invoice.create({
          data: {
            vehicleId,
            accordNumber: hasAccordNumber ? (accordNumber as string) : null,
            dateOfConfirmation: dateOfConfirmation ? new Date(dateOfConfirmation) : null,
            invoiceConfirmed,
            status: invoiceConfirmed && didOrderParts ? "WAITING_FOR_PARTS" : "CONFIRMED_IN_PLANNING",
            workDescription,
            didOrderParts: didOrderParts || false,
            ordersDetails,
            comments,
            handledById: session.user.id,
          },
          include: {
            vehicle: { include: { client: true, base: true } },
            handledBy: { select: { id: true, name: true, email: true } },
          },
        })

        // 2) Historique de changement
        await tx.changeHistory.create({
          data: {
            invoiceId: invoice.id,
            changedBy: session.user.id,
            fieldName: "created",
            newValue: JSON.stringify({
              invoiceConfirmed,
              accordNumber: hasAccordNumber ? accordNumber : null,
              dateOfConfirmation: dateOfConfirmation || null,
              workDescription: workDescription || null,
              didOrderParts: didOrderParts || false,
            }),
            changeType: "created",
          },
        })

        // 3) Historique de status si pièces commandées
        if (invoiceConfirmed && didOrderParts) {
          await tx.statusHistory.create({
            data: {
              invoiceId: invoice.id,
              previousStatus: "CONFIRMED_IN_PLANNING",
              newStatus: "WAITING_FOR_PARTS",
              changedById: session.user.id,
            },
          })
        }

        // 4) Upload + insert InvoicePhoto
        const createdPhotos: any[] = []

        for (const file of files) {
          if (!(file instanceof File)) continue

          const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg"
          const blobName = `invoice/${invoice.id}/${randomUUID()}.${ext}`

          const blockBlob = container.getBlockBlobClient(blobName)
          const buffer = Buffer.from(await file.arrayBuffer())

          await blockBlob.uploadData(buffer, {
            blobHTTPHeaders: { blobContentType: file.type || "application/octet-stream" },
          })

          uploadedBlobNames.push(blobName)

          const row = await tx.invoicePhoto.create({
            data: {
              invoiceId: invoice.id,
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

        return { invoice, photos: createdPhotos }
      })

      return NextResponse.json({ ...result.invoice, photos: result.photos }, { status: 201 })
    } catch (err: any) {
      // cleanup azure blobs
      try {
        await Promise.all(
          uploadedBlobNames.map(async (blobName) => {
            const blobClient = container.getBlockBlobClient(blobName)
            await blobClient.deleteIfExists()
          })
        )
      } catch (cleanupErr: any) {
        logError("Cleanup Azure blobs failed", cleanupErr)
      }
      throw err
    }
  } catch (error: any) {
    if (error?.code === "P2003") {
      logError("Failed to create invoice - invalid vehicle", error)
      return NextResponse.json({ error: "Véhicule invalide" }, { status: 400 })
    }

    logError("Failed to create invoice", error)
    return NextResponse.json({ error: "Échec de la création de l'intervention" }, { status: 500 })
  }
}
