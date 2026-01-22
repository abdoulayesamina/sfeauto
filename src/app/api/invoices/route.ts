import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/src/lib/prisma"
import { auth } from "@/auth"
import { logError } from "@/src/lib/logger"
import { randomUUID } from "crypto"
import { getContainerClient, getSasUrlForBlob } from "@/src/lib/azureBlob"

export const runtime = "nodejs"

const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB
const ALLOWED_PREFIX = "image/"

// Helpers
function asString(v: FormDataEntryValue | null): string | null {
  if (!v) return null
  if (typeof v === "string") return v
  // if it's File, not expected for text fields
  return null
}

function asBool(v: FormDataEntryValue | null): boolean {
  const s = asString(v)
  if (!s) return false
  return ["true", "1", "yes", "oui", "on"].includes(s.toLowerCase())
}

function parseDateOrNull(v: string | null): Date | null {
  if (!v) return null
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}

// POST /api/invoices - Create a new invoice (intervention) + optional photos
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "MANAGER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const contentType = request.headers.get("content-type") || ""
    const isMultipart = contentType.includes("multipart/form-data")

    // -------------------------
    // 1) Lire données (JSON ou FormData)
    // -------------------------
    let vehicleId: string | null = null
    let accordNumber: string | null = null
    let dateOfConfirmation: string | null = null
    let workDescription: string | null = null
    let didOrderParts: boolean = false
    let ordersDetails: string | null = null
    let comments: string | null = null

    let files: File[] = []

    if (isMultipart) {
      const form = await request.formData()

      vehicleId = asString(form.get("vehicleId"))
      accordNumber = asString(form.get("accordNumber"))
      dateOfConfirmation = asString(form.get("dateOfConfirmation"))
      workDescription = asString(form.get("workDescription"))
      didOrderParts = asBool(form.get("didOrderParts"))
      ordersDetails = asString(form.get("ordersDetails"))
      comments = asString(form.get("comments"))

      // IMPORTANT: on attend "photos" (multiples)
      files = (form.getAll("photos") as File[])?.filter(Boolean) ?? []
    } else {
      const body = await request.json()

      vehicleId = body.vehicleId ?? null
      accordNumber = body.accordNumber ?? null
      dateOfConfirmation = body.dateOfConfirmation ?? null
      workDescription = body.workDescription ?? null
      didOrderParts = Boolean(body.didOrderParts)
      ordersDetails = body.ordersDetails ?? null
      comments = body.comments ?? null

      // JSON => pas de fichiers
      files = []
    }

    console.log("[API /invoices] multipart =", isMultipart)
    console.log("[API /invoices] vehicleId :", vehicleId)
    console.log("[API /invoices] accordNumber :", accordNumber)
    console.log("[API /invoices] dateOfConfirmation :", dateOfConfirmation)
    console.log("[API /invoices] didOrderParts :", didOrderParts)
    console.log("[API /invoices] files count :", files.length)
    console.log("[API /invoices] session.user.id :", session.user?.id)

    // -------------------------
    // 2) Validations identiques à ton code
    // -------------------------
    if (!vehicleId) {
      return NextResponse.json(
        { error: "L'identifiant du véhicule est requis" },
        { status: 400 }
      )
    }

    // accordNumber peut être vide => null
    const hasAccordNumber =
      typeof accordNumber === "string" && accordNumber.trim().length > 0

    // Calcul correct de invoiceConfirmed (Boolean)
    const invoiceConfirmed = Boolean(hasAccordNumber && !!dateOfConfirmation)

    // Validate dateOfConfirmation (si fournie)
    if (dateOfConfirmation) {
      const confirmationDate = new Date(dateOfConfirmation)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      if (confirmationDate > today) {
        return NextResponse.json(
          { error: "La date de confirmation ne peut pas être dans le futur" },
          { status: 400 }
        )
      }
    }

    // -------------------------
    // 3) Créer l'intervention (Invoice)
    // -------------------------
    const invoice = await prisma.invoice.create({
      data: {
        vehicleId,
        accordNumber: hasAccordNumber ? (accordNumber as string) : null,
        dateOfConfirmation: dateOfConfirmation ? new Date(dateOfConfirmation) : null,
        invoiceConfirmed,
        status:
          invoiceConfirmed && didOrderParts
            ? "WAITING_FOR_PARTS"
            : "CONFIRMED_IN_PLANNING",
        workDescription,
        didOrderParts: didOrderParts || false,
        ordersDetails,
        comments,
        handledById: session.user.id,
      },
      include: {
        vehicle: {
          include: {
            client: true,
            base: true,
          },
        },
        handledBy: {
          select: {
            name: true,
            email: true,
          },
        },
        photos: true, // ✅ pour cohérence (vide au départ)
      },
    })

    console.log("[API /invoices] Invoice créée :", invoice.id)

    // -------------------------
    // 4) Historique de changement (comme ton code)
    // -------------------------
    await prisma.changeHistory.create({
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

    // Historique de status si pièces commandées
    if (invoiceConfirmed && didOrderParts) {
      await prisma.statusHistory.create({
        data: {
          invoiceId: invoice.id,
          previousStatus: "CONFIRMED_IN_PLANNING",
          newStatus: "WAITING_FOR_PARTS",
          changedById: session.user.id,
        },
      })
    }

    // -------------------------
    // 5) Upload des photos (si multipart + photos)
    // -------------------------
    let createdPhotos: any[] = []

    if (isMultipart && files.length > 0) {
      const container = getContainerClient()
      await container.createIfNotExists()

      for (const file of files) {
        if (!(file instanceof File)) continue

        if (!file.type?.startsWith(ALLOWED_PREFIX)) {
          return NextResponse.json(
            { error: `Type non supporté: ${file.type || "unknown"}` },
            { status: 400 }
          )
        }

        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { error: `Fichier trop lourd: ${file.name}` },
            { status: 400 }
          )
        }

        const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg"
        const blobName = `invoice/${invoice.id}/${randomUUID()}.${ext}`

        const blockBlob = container.getBlockBlobClient(blobName)
        const buffer = Buffer.from(await file.arrayBuffer())

        await blockBlob.uploadData(buffer, {
          blobHTTPHeaders: { blobContentType: file.type },
        })

        const row = await prisma.invoicePhoto.create({
          data: {
            invoiceId: invoice.id,
            blobName,
            url: blockBlob.url,
            contentType: file.type,
            size: file.size,
            uploadedById: session.user.id,
          },
        })

        createdPhotos.push({
          ...row,
          sasUrl: getSasUrlForBlob(blobName),
        })
      }
    }

    // -------------------------
    // 6) Retourner l'invoice + photos[]
    // -------------------------
    // On renvoie un objet enrichi: photos + sasUrl
    const responseInvoice = {
      ...invoice,
      photos: createdPhotos.length
        ? createdPhotos
        : (invoice.photos || []).map(p => ({
            ...p,
            sasUrl: getSasUrlForBlob(p.blobName),
          })),
    }

    return NextResponse.json(responseInvoice, { status: 201 })
  } catch (error: any) {
    // FK constraint (véhicule invalide)
    if (error?.code === "P2003") {
      logError("Failed to create invoice - invalid vehicle", error)
      return NextResponse.json({ error: "Véhicule invalide" }, { status: 400 })
    }

    logError("Failed to create invoice", error)
    return NextResponse.json(
      { error: "Échec de la création de l'intervention : " },
      { status: 500 }
    )
  }
}
