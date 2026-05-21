import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { randomUUID } from "crypto";
import { getContainerClient, getSasUrlForBlob } from "@/src/lib/azureBlob";
import { logError } from "@/src/lib/logger";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_PREFIX = "image/";

type Ctx = { params: Promise<{ id: string }> | { id: string } };

function isPromise<T>(v: unknown): v is Promise<T> {
  return !!v && typeof v === "object" && typeof (v as any).then === "function";
}

async function getParamId(ctx: Ctx): Promise<string> {
  const p = isPromise<{ id: string }>(ctx.params) ? await ctx.params : ctx.params;
  return p?.id;
}

async function getIntervention(interventionId: string) {
  return (prisma as any).intervention_int.findUnique({
    where: { int_id: interventionId },
    select: {
      int_id: true,
      int_baseId: true,
      int_vehicle: { select: { veh_baseId: true } },
    },
  }) as Promise<{ int_id: string; int_baseId: string | null; int_vehicle: { veh_baseId: string } } | null>;
}

function checkAgenceAccess(
  intervention: { int_baseId: string | null; int_vehicle: { veh_baseId: string } },
  userBaseId: string
): boolean {
  // Utiliser int_baseId (agence au moment de l'intervention) avec fallback sur veh_baseId actuel
  const interventionBaseId = intervention.int_baseId ?? intervention.int_vehicle.veh_baseId;
  return interventionBaseId === userBaseId;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const session = await auth();

    if (!session || !["MANAGER", "MECHANIC", "CLIENT", "AGENCE", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const interventionId = await getParamId(ctx);

    if (!interventionId || interventionId === "undefined" || interventionId === "null") {
      return NextResponse.json({ error: "interventionId invalide" }, { status: 400 });
    }

    const intervention = await getIntervention(interventionId);

    if (!intervention) {
      return NextResponse.json({ error: "Intervention introuvable" }, { status: 404 });
    }

    if (session.user.role === "AGENCE") {
      const userBaseId = session.user.baseId;
      if (!userBaseId) {
        return NextResponse.json({ error: "Compte agence sans baseId" }, { status: 403 });
      }
      if (!checkAgenceAccess(intervention, userBaseId)) {
        return NextResponse.json(
          { error: "Vous ne pouvez pas consulter les photos d'une autre agence" },
          { status: 403 }
        );
      }
    }

    const photos = await prisma.interventionphoto_itp.findMany({
      where: { itp_interventionId: interventionId },
      orderBy: { itp_createdAt: "desc" },
      select: {
        itp_id: true,
        itp_blobName: true,
        itp_url: true,
        itp_contentType: true,
        itp_size: true,
        itp_createdAt: true,
      },
    });

    return NextResponse.json({
      photos: photos.map((p) => ({
        id: p.itp_id,
        blobName: p.itp_blobName,
        url: p.itp_url,
        contentType: p.itp_contentType,
        size: p.itp_size,
        createdAt: p.itp_createdAt,
        sasUrl: getSasUrlForBlob(p.itp_blobName),
      })),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, ctx: Ctx) {
  try {
    const session = await auth();
    const role = session?.user?.role;

    if (!session || !["MANAGER", "AGENCE", "ADMIN", "MECHANIC"].includes(role as string)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const interventionId = await getParamId(ctx);

    if (!interventionId || interventionId === "undefined" || interventionId === "null") {
      return NextResponse.json({ error: "interventionId invalide" }, { status: 400 });
    }

    const intervention = await getIntervention(interventionId);

    if (!intervention) {
      return NextResponse.json({ error: "Intervention introuvable" }, { status: 404 });
    }

    if (role === "AGENCE") {
      const userBaseId = session.user.baseId;
      if (!userBaseId) {
        return NextResponse.json({ error: "Compte agence sans baseId" }, { status: 403 });
      }
      if (!checkAgenceAccess(intervention, userBaseId)) {
        return NextResponse.json(
          { error: "Vous ne pouvez pas ajouter des photos à une intervention d'une autre agence" },
          { status: 403 }
        );
      }
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Utilisez multipart/form-data" }, { status: 400 });
    }

    const form = await request.formData();
    const files = (form.getAll("files") as File[]) ?? [];

    if (!files.length) {
      return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
    }

    const container = getContainerClient();
    await container.createIfNotExists();

    const createdPhotos: any[] = [];
    const uploadedBlobNames: string[] = [];

    try {
      for (const file of files) {
        if (!(file instanceof File)) continue;

        if (!file.type?.startsWith(ALLOWED_PREFIX)) {
          return NextResponse.json({ error: "Type non supporté" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json({ error: "Fichier trop lourd (8MB max)" }, { status: 400 });
        }

        const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
        const blobName = `intervention/${interventionId}/${randomUUID()}.${ext}`;

        const blockBlob = container.getBlockBlobClient(blobName);
        const buffer = Buffer.from(await file.arrayBuffer());

        await blockBlob.uploadData(buffer, {
          blobHTTPHeaders: { blobContentType: file.type || "application/octet-stream" },
        });

        uploadedBlobNames.push(blobName);

        const row = await prisma.interventionphoto_itp.create({
          data: {
            itp_interventionId: interventionId,
            itp_blobName: blobName,
            itp_url: blockBlob.url,
            itp_contentType: file.type || null,
            itp_size: file.size,
            itp_uploadedById: session.user.id ?? null,
          },
        });

        createdPhotos.push({
          id: row.itp_id,
          blobName: row.itp_blobName,
          url: row.itp_url,
          contentType: row.itp_contentType,
          size: row.itp_size,
          createdAt: row.itp_createdAt,
          sasUrl: getSasUrlForBlob(blobName),
        });
      }

      return NextResponse.json({ photos: createdPhotos }, { status: 201 });
    } catch (err: any) {
      try {
        await Promise.all(
          uploadedBlobNames.map(async (blobName) => {
            const blobClient = container.getBlockBlobClient(blobName);
            await blobClient.deleteIfExists();
          })
        );
      } catch (cleanupErr: any) {
        logError("Cleanup Azure blobs failed", cleanupErr);
      }
      throw err;
    }
  } catch (error: any) {
    logError("Failed to upload photos (edit)", error);
    return NextResponse.json({ error: "Erreur upload photos" }, { status: 500 });
  }
}
