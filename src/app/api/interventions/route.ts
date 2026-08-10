import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { randomUUID } from "crypto";
import { getContainerClient, getSasUrlForBlob } from "@/src/lib/azureBlob";
import { notifyAdmins } from "@/src/lib/notifications";
import { adaptLegacyIntervention } from "@/src/utils/constants/intervention-status";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB security limit
const ALLOWED_PREFIX = "image/";

function asString(v: FormDataEntryValue | null): string | null {
  if (!v) return null;
  return typeof v === "string" ? v : null;
}

function asBool(v: FormDataEntryValue | null): boolean {
  const s = asString(v);
  if (!s) return false;
  return ["true", "1", "yes", "oui", "on"].includes(s.toLowerCase());
}

function parseOptionalDate(value: string | null): Date | null {
  if (!value?.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error("INVALID_DATE");
  }
  return d;
}

function normalizeOptionalString(value: string | null): string | null {
  const s = value?.trim();
  return s ? s : null;
}

// ============================
// GET /api/interventions
// Liste allégée + stats agrégées, pensée pour le tableau de bord (pas de
// photos/devis embarqués — chaque écran de détail les refetch lui-même).
// ============================
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = session?.user?.role;

    if (!session || !["ADMIN", "MECHANIC"].includes(role as string)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientIdParam = normalizeOptionalString(searchParams.get("clientId"));
    const agenceIdParam = normalizeOptionalString(searchParams.get("agenceId"));
    const searchParam = normalizeOptionalString(searchParams.get("search"));
    const dateParam = normalizeOptionalString(searchParams.get("date"));

    let dateRange: { gte: Date; lt: Date } | null = null;
    if (dateParam) {
      const start = parseOptionalDate(dateParam);
      if (start) {
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        dateRange = { gte: start, lt: end };
      }
    }

    const vehicleScope =
      clientIdParam || agenceIdParam
        ? {
            ...(clientIdParam ? { veh_clientId: clientIdParam } : {}),
            ...(agenceIdParam ? { veh_baseId: agenceIdParam } : {}),
          }
        : undefined;

    const baseWhere = {
      int_supprimee: false,
      int_status: { not: "DELETED" as const },
      ...(vehicleScope ? { int_vehicle: vehicleScope } : {}),
      ...(searchParam
        ? {
            OR: [
              { int_vehicle: { veh_licensePlate: { contains: searchParam } } },
              { int_vehicle: { veh_brand: { bra_name: { contains: searchParam } } } },
              { int_vehicle: { veh_model: { mod_name: { contains: searchParam } } } },
            ],
          }
        : {}),
      ...(dateRange ? { int_updatedAt: dateRange } : {}),
    };

    const [interventions, statusGroups, annuleesCount, refuseesCount] = await Promise.all([
      prisma.intervention_int.findMany({
        where: baseWhere,
        select: {
          int_id: true,
          int_accordNumber: true,
          int_dateOfConfirmation: true,
          int_status: true,
          int_statusUpdatedAt: true,
          int_workDescription: true,
          int_comments: true,
          int_didOrderParts: true,
          int_ordersDetails: true,
          int_createdAt: true,
          int_updatedAt: true,
          int_handledBy: {
            select: { usr_id: true, usr_name: true, usr_email: true },
          },
          int_vehicle: {
            select: {
              veh_id: true,
              veh_licensePlate: true,
              veh_year: true,
              veh_color: true,
              veh_entryDate: true,
              veh_brand: { select: { bra_name: true } },
              veh_model: { select: { mod_name: true } },
              veh_client: { select: { cli_id: true, cli_name: true } },
              veh_base: { select: { bas_id: true, bas_location: true } },
            },
          },
        },
        orderBy: { int_updatedAt: "desc" },
        take: 5000,
      }),
      prisma.intervention_int.groupBy({
        by: ["int_status"],
        where: baseWhere,
        _count: true,
      }) as any,
      prisma.intervention_int.count({
        where: { int_supprimee: false, AND: [vehicleScope ? { int_vehicle: vehicleScope } : {}, { OR: [{ int_status: "CANCELLED" }, { int_annulee: true }] }] },
      }),
      prisma.intervention_int.count({
        where: { int_supprimee: false, AND: [vehicleScope ? { int_vehicle: vehicleScope } : {}, { OR: [{ int_status: "REFUSED" }, { int_accordNumber: "REFUSE" }] }] },
      }),
    ]);

    const stats = {
      total: statusGroups.reduce((sum: number, g: any) => sum + g._count, 0) + annuleesCount + refuseesCount,
      enCours:
        statusGroups.find((g: any) => g.int_status === "FIXING_STARTED")?._count ?? 0,
      terminees:
        statusGroups.find((g: any) => g.int_status === "FIXING_FINISHED")?._count ?? 0,
      attente:
        statusGroups.find((g: any) => g.int_status === "WAITING_FOR_PARTS")?._count ?? 0,
      annulees: annuleesCount,
      refusees: refuseesCount,
    };

    const adaptedInterventions = interventions.map(adaptLegacyIntervention);

    return NextResponse.json({ interventions: adaptedInterventions, stats });
  } catch (error) {
    logError("Failed to fetch interventions", error);
    return NextResponse.json(
      { error: "Échec de la récupération des interventions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    const role = session?.user?.role;
    if (!session || !["MANAGER", "AGENCE", "ADMIN", "MECHANIC"].includes(role as string)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Format invalide : utilisez multipart/form-data." },
        { status: 400 }
      );
    }

    const form = await request.formData();

    const vehicleId = asString(form.get("vehicleId"));
    const accordNumberRaw = asString(form.get("accordNumber"));
    const dateOfConfirmationRaw = asString(form.get("dateOfConfirmation"));
    const workDescriptionRaw = asString(form.get("workDescription"));
    const didOrderParts = asBool(form.get("didOrderParts"));
    const ordersDetailsRaw = asString(form.get("ordersDetails"));
    const commentsRaw = asString(form.get("comments"));
    const kilometrage = asString(form.get("kilometrage")) || "";

    const files = (form.getAll("photos") as File[]) ?? [];

    console.log("Upload de", files.length, "photos");

    if (!vehicleId) {
      return NextResponse.json({ error: "VehicleId requis" }, { status: 400 });
    }

    const accordNumber = accordNumberRaw?.trim() || null;
    const workDescription = workDescriptionRaw?.trim() || null;
    const ordersDetails = ordersDetailsRaw?.trim() || null;
    const comments = commentsRaw?.trim() || null;
    const hasAccordNumber = Boolean(accordNumber);

    let confirmationDate: Date | null = null;
    try {
      confirmationDate = parseOptionalDate(dateOfConfirmationRaw);
    } catch {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    const vehicle = await prisma.vehicle_veh.findUnique({
      where: { veh_id: vehicleId },
      select: { veh_id: true, veh_baseId: true, veh_clientId: true, veh_kilometrage: true, veh_absent: true, veh_licensePlate: true },
    });

    if (!vehicle) {
      return NextResponse.json({ error: "Véhicule invalide" }, { status: 400 });
    }

    if (vehicle.veh_absent) {
      return NextResponse.json(
        { error: "Véhicule absent : aucune intervention possible" },
        { status: 409 }
      );
    }

    const currentKm = parseInt(vehicle.veh_kilometrage || "0", 10);
    const newKm = parseInt(kilometrage || "0", 10);

    if (newKm < currentKm) {
      return NextResponse.json(
        { error: "Kilométrage invalide" },
        { status: 400 }
      );
    }

    if (Number(kilometrage) > 1000000) {
      return NextResponse.json(
        {
          error: `Le kilométrage de l'intervention (${kilometrage}) dépasse la limite maximale de 1000000`,
        },
        { status: 400 }
      );
    }

    if (role === "AGENCE") {
      const userBaseId = session.user.baseId;
      if (!userBaseId) {
        return NextResponse.json(
          { error: "Compte agence sans baseId" },
          { status: 403 }
        );
      }

      if (vehicle.veh_baseId !== userBaseId) {
        return NextResponse.json(
          { error: "Vous ne pouvez pas créer d’intervention pour une autre agence" },
          { status: 403 }
        );
      }
    }

    for (const f of files) {
      if (!(f instanceof File)) continue;

      if (!f.type?.startsWith(ALLOWED_PREFIX)) {
        return NextResponse.json(
          { error: `Type non supporté: ${f.type}` },
          { status: 400 }
        );
      }

      if (f.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `Fichier trop lourd: ${f.name}` },
          { status: 400 }
        );
      }
    }

    const container = getContainerClient();
    await container.createIfNotExists();

    let uploadedBlobNames: string[] = [];

    try {
      // UPLOAD PARALLÈLE
      const uploadedBlobsRaw = await Promise.all(
        files.map(async (file) => {
          if (!(file instanceof File)) return null;

          try {
            const ext = file.name.includes(".")
              ? file.name.split(".").pop()
              : "jpg";

            const blobName = `intervention/${randomUUID()}.${ext}`;
            const blockBlob = container.getBlockBlobClient(blobName);

            const buffer = Buffer.from(await file.arrayBuffer());

            await blockBlob.uploadData(buffer, {
              blobHTTPHeaders: {
                blobContentType: file.type || "application/octet-stream",
              },
            });

            uploadedBlobNames.push(blobName);

            return {
              blobName,
              url: blockBlob.url,
              contentType: file.type || null,
              size: file.size,
            };
          } catch (err) {
            console.error("❌ Upload échoué:", file.name, err);
            throw new Error(`Erreur upload image: ${file.name}`);
          }
        })
      );

      const uploadedBlobs = uploadedBlobsRaw.filter(Boolean) as any[];

      // ✅ TRANSACTION RAPIDE
      const result = await prisma.$transaction(async (tx) => {
        const intervention = await tx.intervention_int.create({
          data: {
            int_vehicleId: vehicleId,
            int_clientId: vehicle.veh_clientId,
            int_baseId: vehicle.veh_baseId,
            int_accordNumber: accordNumber,
            int_dateOfConfirmation: confirmationDate,
            int_interventionConfirmed: true,
            int_kilometrage: kilometrage,
            int_status: didOrderParts
              ? "WAITING_FOR_PARTS"
              : "FIXING_STARTED",
            int_statusUpdatedAt: new Date(),
            int_workDescription: workDescription,
            int_didOrderParts: didOrderParts,
            int_ordersDetails: ordersDetails,
            int_comments: comments,
            int_handledById: session.user.id ?? null,
          },
        });

        const createdPhotos = [];

        for (const blob of uploadedBlobs) {
          const row = await tx.interventionphoto_itp.create({
            data: {
              itp_interventionId: intervention.int_id,
              itp_blobName: blob.blobName,
              itp_url: blob.url,
              itp_contentType: blob.contentType,
              itp_size: blob.size,
              itp_uploadedById: session.user.id ?? null,
            },
          });

          createdPhotos.push({
            ...row,
            sasUrl: getSasUrlForBlob(blob.blobName),
          });
        }

        return { intervention, photos: createdPhotos };
      });

      await notifyAdmins({
        type: "INTERVENTION_CREATED",
        title: "Nouvelle intervention",
        message: `Nouvelle intervention pour le véhicule ${vehicle.veh_licensePlate}.`,
        interventionId: result.intervention.int_id,
        excludeUserId: session.user.id ?? null,
      });

      return NextResponse.json(
        {
          message: "Intervention créée",
          intervention: result.intervention,
          photos: result.photos,
        },
        { status: 201 }
      );

    } catch (err: any) {
      console.error("Erreur globale:", err);

      // 🧹 CLEANUP
      try {
        await Promise.all(
          uploadedBlobNames.map(async (blobName) => {
            const blobClient = container.getBlockBlobClient(blobName);
            await blobClient.deleteIfExists();
          })
        );
      } catch (cleanupErr) {
        logError("Cleanup Azure blobs failed", cleanupErr);
      }

      throw err;
    }

  } catch (error: any) {
    logError("Failed to create intervention", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}


// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/src/lib/prisma";
// import { auth } from "@/auth";
// import { logError } from "@/src/lib/logger";
// import { randomUUID } from "crypto";
// import { getContainerClient, getSasUrlForBlob } from "@/src/lib/azureBlob";

// export const runtime = "nodejs";

// const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB security limit
// const ALLOWED_PREFIX = "image/";

// function asString(v: FormDataEntryValue | null): string | null {
//   if (!v) return null;
//   return typeof v === "string" ? v : null;
// }

// function asBool(v: FormDataEntryValue | null): boolean {
//   const s = asString(v);
//   if (!s) return false;
//   return ["true", "1", "yes", "oui", "on"].includes(s.toLowerCase());
// }

// function parseOptionalDate(value: string | null): Date | null {
//   if (!value?.trim()) return null;
//   const d = new Date(value);
//   if (Number.isNaN(d.getTime())) {
//     throw new Error("INVALID_DATE");
//   }
//   return d;
// }

// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth();

//     const role = session?.user?.role;
//     if (!session || !["MANAGER", "AGENCE", "ADMIN", "MECHANIC"].includes(role as string)) {
//       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
//     }

//     const contentType = request.headers.get("content-type") || "";
//     if (!contentType.includes("multipart/form-data")) {
//       return NextResponse.json(
//         {
//           error:
//             "Format invalide : utilisez multipart/form-data (FormData) pour envoyer l’intervention + photos.",
//         },
//         { status: 400 }
//       );
//     }

//     const form = await request.formData();

//     const vehicleId = asString(form.get("vehicleId"));
//     const accordNumberRaw = asString(form.get("accordNumber"));
//     const dateOfConfirmationRaw = asString(form.get("dateOfConfirmation"));
//     const workDescriptionRaw = asString(form.get("workDescription"));
//     const didOrderParts = asBool(form.get("didOrderParts"));
//     const ordersDetailsRaw = asString(form.get("ordersDetails"));
//     const commentsRaw = asString(form.get("comments"));
//     const kilometrage = asString(form.get("kilometrage")) || "";

//     const files = (form.getAll("photos") as File[]) ?? [];

//     if (!vehicleId) {
//       return NextResponse.json(
//         { error: "L'identifiant du véhicule est requis" },
//         { status: 400 }
//       );
//     }

//     const accordNumber = accordNumberRaw?.trim() ? accordNumberRaw.trim() : null;
//     const workDescription = workDescriptionRaw?.trim() ? workDescriptionRaw.trim() : null;
//     const ordersDetails = ordersDetailsRaw?.trim() ? ordersDetailsRaw.trim() : null;
//     const comments = commentsRaw?.trim() ? commentsRaw.trim() : null;
//     const hasAccordNumber = Boolean(accordNumber);

//     let confirmationDate: Date | null = null;
//     try {
//       confirmationDate = parseOptionalDate(dateOfConfirmationRaw);
//     } catch {
//       return NextResponse.json(
//         { error: "Date de confirmation invalide" },
//         { status: 400 }
//       );
//     }

//     if (confirmationDate) {
//       const today = new Date();
//       today.setHours(23, 59, 59, 999);

//       if (confirmationDate > today) {
//         return NextResponse.json(
//           { error: "La date de confirmation ne peut pas être dans le futur" },
//           { status: 400 }
//         );
//       }
//     }

//     const vehicle = await prisma.vehicle_veh.findUnique({
//       where: { veh_id: vehicleId },
//       select: {
//         veh_id: true,
//         veh_baseId: true,
//         veh_kilometrage: true,
//       },
//     });

//     if (!vehicle) {
//       return NextResponse.json({ error: "Véhicule invalide" }, { status: 400 });
//     }

//     const currentKm = parseInt(vehicle.veh_kilometrage || "0", 10);
//     const newKm = parseInt(kilometrage || "0", 10);

//     if (newKm < currentKm) {
//       return NextResponse.json(
//         {
//           error: `Le kilométrage de l'intervention (${newKm}) ne peut pas être inférieur au kilométrage actuel du véhicule (${currentKm})`,
//         },
//         { status: 400 }
//       );
//     }

//     if (role === "AGENCE") {
//       const userBaseId = session.user.baseId;
//       if (!userBaseId) {
//         return NextResponse.json(
//           { error: "Compte agence sans baseId" },
//           { status: 403 }
//         );
//       }

//       if (vehicle.veh_baseId !== userBaseId) {
//         return NextResponse.json(
//           { error: "Vous ne pouvez pas créer d’intervention pour une autre agence" },
//           { status: 403 }
//         );
//       }
//     }

//     for (const f of files) {
//       if (!(f instanceof File)) continue;

//       if (!f.type?.startsWith(ALLOWED_PREFIX)) {
//         return NextResponse.json(
//           { error: `Type non supporté: ${f.type || "unknown"}` },
//           { status: 400 }
//         );
//       }

//       if (f.size > MAX_FILE_SIZE) {
//         return NextResponse.json(
//           { error: `Fichier trop lourd: ${f.name}` },
//           { status: 400 }
//         );
//       }
//     }

//     if (hasAccordNumber) {
//       const existing = await prisma.intervention_int.findFirst({
//         where: { int_accordNumber: accordNumber },
//         select: {
//           int_id: true,
//           int_vehicleId: true,
//           int_createdAt: true,
//         },
//       });

//       if (existing) {
//         return NextResponse.json(
//           {
//             error: "Numéro d’accord déjà utilisé",
//             code: "ACCORD_NUMBER_ALREADY_EXISTS",
//             details: {
//               accordNumber,
//               interventionId: existing.int_id,
//               createdAt: existing.int_createdAt,
//             },
//           },
//           { status: 409 }
//         );
//       }
//     }

//     const interventionConfirmed = true;
//     const status = didOrderParts
//       ? "WAITING_FOR_PARTS"
//       : "FIXING_STARTED";

//     const container = getContainerClient();
//     await container.createIfNotExists();

//     const uploadedBlobNames: string[] = [];

//     console.log("chg_newValue : ", JSON.stringify({
//       interventionConfirmed,
//       accordNumber,
//       dateOfConfirmation: dateOfConfirmationRaw || null,
//       workDescription,
//       didOrderParts,
//       ordersDetails,
//       comments,
//       status,
//     }));

//     try {
//       const result = await prisma.$transaction(async (tx) => {
//         const intervention = await tx.intervention_int.create({
//           data: {
//             int_vehicleId: vehicleId,
//             int_accordNumber: accordNumber,
//             int_dateOfConfirmation: confirmationDate,
//             int_interventionConfirmed: interventionConfirmed,
//             int_kilometrage: kilometrage,
//             int_status: status,
//             int_statusUpdatedAt: new Date(),
//             int_workDescription: workDescription,
//             int_didOrderParts: didOrderParts,
//             int_ordersDetails: ordersDetails,
//             int_comments: comments,
//             int_handledById: session.user.id ?? null,
//           },
//           include: {
//             int_vehicle: {
//               include: {
//                 veh_client: true,
//                 veh_base: true,
//               },
//             },
//             int_handledBy: {
//               select: {
//                 usr_id: true,
//                 usr_name: true,
//                 usr_email: true,
//               },
//             },
//           },
//         });

//         // Mettre à jour le kilométrage du véhicule
//         await tx.vehicle_veh.update({
//           where: { veh_id: vehicleId },
//           data: { veh_kilometrage: String(newKm) },
//         });

//         await tx.changehistory_chg.create({
//           data: {
//             chg_interventionId: intervention.int_id,
//             chg_changedBy: session.user.id,
//             chg_fieldName: "created",
//             chg_oldValue: null,
//             chg_newValue: JSON.stringify({
//               interventionConfirmed,
//               accordNumber,
//               dateOfConfirmation: dateOfConfirmationRaw || null,
//               workDescription,
//               didOrderParts,
//               ordersDetails,
//               comments,
//               status,
//             }),
//             chg_changeType: "created",
//           },
//         });

//         if (didOrderParts) {
//           await tx.statushistory_sth.create({
//             data: {
//               sth_interventionId: intervention.int_id,
//               sth_previousStatus: "FIXING_STARTED",
//               sth_newStatus: "WAITING_FOR_PARTS",
//               sth_changedById: session.user.id,
//             },
//           });
//         }

//         const createdPhotos: any[] = [];

//         for (const file of files) {
//           if (!(file instanceof File)) continue;

//           const ext = file.name.includes(".")
//             ? file.name.split(".").pop()
//             : "jpg";

//           const blobName = `intervention/${intervention.int_id}/${randomUUID()}.${ext}`;

//           const blockBlob = container.getBlockBlobClient(blobName);
//           const buffer = Buffer.from(await file.arrayBuffer());

//           await blockBlob.uploadData(buffer, {
//             blobHTTPHeaders: {
//               blobContentType: file.type || "application/octet-stream",
//             },
//           });

//           uploadedBlobNames.push(blobName);

//           const row = await tx.interventionphoto_itp.create({
//             data: {
//               itp_interventionId: intervention.int_id,
//               itp_blobName: blobName,
//               itp_url: blockBlob.url,
//               itp_contentType: file.type || null,
//               itp_size: file.size,
//               itp_uploadedById: session.user.id ?? null,
//             },
//           });

//           createdPhotos.push({
//             ...row,
//             sasUrl: getSasUrlForBlob(blobName),
//           });
//         }

//         return { intervention, photos: createdPhotos };
//       });

//       const message = hasAccordNumber
//         ? `Intervention créée avec le numéro d’accord: ${accordNumber}`
//         : "Intervention créée (sans numéro d’accord)";

//       return NextResponse.json(
//         {
//           message,
//           meta: {
//             accordNumberProvided: hasAccordNumber,
//             accordNumber,
//           },
//           intervention: result.intervention,
//           photos: result.photos,
//         },
//         { status: 201 }
//       );
//     } catch (err: any) {
//       try {
//         await Promise.all(
//           uploadedBlobNames.map(async (blobName) => {
//             const blobClient = container.getBlockBlobClient(blobName);
//             await blobClient.deleteIfExists();
//           })
//         );
//       } catch (cleanupErr: any) {
//         logError("Cleanup Azure blobs failed", cleanupErr);
//       }

//       throw err;
//     }
//   } catch (error: any) {
//     if (error?.code === "P2002") {
//       return NextResponse.json(
//         {
//           error: "Numéro d’accord déjà utilisé",
//           code: "ACCORD_NUMBER_ALREADY_EXISTS",
//         },
//         { status: 409 }
//       );
//     }

//     if (error?.code === "P2003") {
//       logError("Failed to create intervention - invalid foreign key", error);
//       return NextResponse.json({ error: "Donnée liée invalide" }, { status: 400 });
//     }

//     logError("Failed to create intervention", error);
//     return NextResponse.json(
//       { error: "Échec de la création de l'intervention" },
//       { status: 500 }
//     );
//   }
// }