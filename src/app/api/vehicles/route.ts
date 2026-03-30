import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { normalizePlate } from "@/src/lib/normalizePlate"; // ✅ BON IMPORT

// Helpers
function parseOptionalInt(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalDate(value: unknown): Date | null {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

function normalizeOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

// ============================
// GET /api/vehicles
// ============================
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["MANAGER", "AGENCE", "MECHANIC", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session.user.role === "AGENCE" && !session.user.baseId) {
      return NextResponse.json(
        { error: "Compte agence sans base associée" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const normalizedSearch = search ? normalizePlate(search) : null; // ✅ AJOUT

    const baseFilter =
      session.user.role === "AGENCE"
        ? { baseId: session.user.baseId ?? "" }
        : {};

    const vehicles = await prisma.vehicle_veh.findMany({
      where: {
        ...baseFilter,
        ...(search
          ? {
            OR: [
              {
                veh_licensePlate: {
                  contains: search
                }
              },
              {
                veh_normalizedPlate: {
                  contains: normalizedSearch ?? ""
                }
              }
            ]
          }
          : {}),
      },
      select: {
        veh_id: true,
        veh_licensePlate: true,
        veh_brandId: true,
        veh_modelId: true,

        veh_year: true,
        veh_color: true,
        veh_firstRegistrationDate: true,
        veh_energy: true,
        veh_doorsCount: true,
        veh_bodyType: true,
        veh_realPowerHp: true,
        veh_fiscalPowerCv: true,
        veh_gearboxType: true,
        veh_version: true,
        veh_registrationCardDate: true,

        veh_entryDate: true,
        veh_exitDate: true,
        veh_createdAt: true,
        veh_updatedAt: true,

        veh_client: { select: { cli_id: true, cli_name: true } },
        veh_base: { select: { bas_id: true, bas_location: true, bas_clientId: true } },

        veh_brand: { select: { bra_id: true, bra_name: true } },
        veh_model: { select: { mod_id: true, mod_name: true } },

        invoices: {
          select: {
            inv_id: true,
            inv_vehicleId: true,
            inv_invoiceConfirmed: true,
            inv_status: true,
            inv_accordNumber: true,
            inv_dateOfConfirmation: true,
            inv_statusUpdatedAt: true,
            inv_workDescription: true,
            inv_didOrderParts: true,
            inv_ordersDetails: true,
            inv_comments: true,
            inv_createdAt: true,
            inv_updatedAt: true,
            photos: { select: { ivp_id: true, ivp_url: true } },
            inv_handledBy: { select: { usr_name: true, usr_email: true } },
            devis: {
              where: { dev_supprimee: false },
              select: { dev_id: true, dev_numdevis: true },
            },
            inv_vehicle: {
              select: {
                veh_licensePlate: true,
                veh_color: true,
                veh_year: true,
                veh_clientId: true,
                veh_baseId: true,
                veh_entryDate: true,
                veh_brand: {
                  select: { bra_name: true }
                },
                veh_model: {
                  select: { mod_name: true }
                },
                veh_client: {
                  select: { cli_name: true }
                },
                veh_base: {
                  select: { bas_location: true }
                }
              }
            }
          },
          orderBy: { inv_createdAt: "desc" },
        },
      },
      orderBy: { veh_createdAt: "desc" },
      take: search ? 10 : 100,
      });
    
    return NextResponse.json({ vehicles });
  } catch (error) {
    logError("Failed to fetch vehicles", error);
    return NextResponse.json(
      { error: "Échec de la récupération des véhicules" },
      { status: 500 }
    );
  }
}

// ============================
// POST /api/vehicles
// ============================
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || !["MANAGER", "AGENCE"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session.user.role === "AGENCE" && !session.user.baseId) {
      return NextResponse.json(
        { error: "Compte agence sans base associée" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      veh_licensePlate: licensePlate,
      veh_brandId: brandId,
      veh_modelId: modelId,
      veh_year: year,
      veh_color: color,
      veh_clientId: clientId,
      veh_baseId: baseId,
      veh_entryDate: entryDate,
      veh_exitDate: exitDate,
      veh_firstRegistrationDate: firstRegistrationDate,
      veh_energy: energy,
      veh_doorsCount: doorsCount,
      veh_bodyType: bodyType,
      veh_realPowerHp: realPowerHp,
      veh_fiscalPowerCv: fiscalPowerCv,
      veh_gearboxType: gearboxType,
      veh_version: version,
      veh_registrationCardDate: registrationCardDate,
    } = body;

    if (!String(brandId ?? "").trim()) {
      return NextResponse.json({ error: "Marque requise" }, { status: 400 });
    }
    if (!String(modelId ?? "").trim()) {
      return NextResponse.json({ error: "Modèle requise" }, { status: 400 });
    }

    if (!String(licensePlate ?? "").trim()) {
      return NextResponse.json({ error: "Immatriculation requise" }, { status: 400 });
    }

    const cleanPlate = String(licensePlate).trim(); // ✅ AJOUT

    let finalBaseId: string | null = baseId ? String(baseId) : null;
    let finalClientId: string | null = clientId ? String(clientId) : null;

    if (session.user.role === "AGENCE") {
      finalBaseId = session.user.baseId!;
      const base = await prisma.base_bas.findUnique({
        where: { bas_id: finalBaseId },
        select: { bas_clientId: true },
      });

      if (!base) {
        return NextResponse.json({ error: "Base agence introuvable" }, { status: 400 });
      }

      finalClientId = base.bas_clientId;
    }

    if (session.user.role === "MANAGER") {
      if (!String(finalClientId ?? "").trim() || !String(finalBaseId ?? "").trim()) {
        return NextResponse.json(
          { error: "Immatriculation, client et agence requis" },
          { status: 400 }
        );
      }
    }

    const vehicle = await prisma.vehicle_veh.create({
      data: {
        veh_licensePlate: cleanPlate,
        veh_normalizedPlate: normalizePlate(cleanPlate), // 🔥 IMPORTANT

        veh_brandId: brandId || null,
        veh_modelId: modelId || null,
        veh_year: parseOptionalInt(year),
        // color: normalizeOptionalString(color),

        veh_color: normalizeOptionalString(color),
        veh_version: normalizeOptionalString(version),

        veh_bodyType: bodyType?.trim() || null,
        veh_gearboxType: gearboxType?.trim() || null,
        veh_energy: energy?.trim() || null,

        veh_firstRegistrationDate: parseOptionalDate(firstRegistrationDate),
        // energy: energy ?? null,
        veh_doorsCount: parseOptionalInt(doorsCount),
        // bodyType: bodyType ?? null,
        veh_realPowerHp: parseOptionalInt(realPowerHp),
        veh_fiscalPowerCv: parseOptionalInt(fiscalPowerCv),
        // gearboxType: gearboxType ?? null,
        // version: normalizeOptionalString(version),
        veh_registrationCardDate: parseOptionalDate(registrationCardDate),

        veh_clientId: finalClientId!,
        veh_baseId: finalBaseId!,

        veh_entryDate: entryDate ? new Date(entryDate) : new Date(),
        veh_exitDate: exitDate ? new Date(exitDate) : null,

        veh_handledById: session.user.id,
      },
      include: {
        veh_client: true,
        veh_base: { select: { bas_id: true, bas_location: true } },
        veh_handledBy: { select: { usr_name: true, usr_email: true } },
      },
    });

    return NextResponse.json(vehicle, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      logError("Duplicate vehicle", error);
      return NextResponse.json(
        { error: "Un véhicule avec cette immatriculation existe déjà" },
        { status: 409 }
      );
    }

    logError("Failed to create vehicle", error);
    return NextResponse.json(
      { error: "Échec de la création du véhicule" },
      { status: 500 }
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";

// import { auth } from "@/auth";
// import { logError } from "@/src/lib/logger";
// import { prisma } from "@/src/lib/prisma";
// import { tr } from "zod/v4/locales";
// import { normalizePlate } from "@/src/utils/searchSmart"

// // Helpers
// function parseOptionalInt(value: unknown): number | null {
//   if (value === undefined || value === null || value === "") return null;
//   const n = typeof value === "number" ? value : parseInt(String(value), 10);
//   return Number.isFinite(n) ? n : null;
// }

// function parseOptionalDate(value: unknown): Date | null {
//   if (value === undefined || value === null || value === "") return null;
//   const d = new Date(String(value));
//   return isNaN(d.getTime()) ? null : d;
// }

// function normalizeOptionalString(value: unknown): string | null {
//   if (value === undefined || value === null) return null;
//   const s = String(value).trim();
//   return s.length ? s : null;
// }

// // GET /api/vehicles
// // ============================
// export async function GET(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user || !["MANAGER", "AGENCE", "MECHANIC", "ADMIN"].includes(session.user.role)) {
//       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
//     }

//     if (session.user.role === "AGENCE" && !session.user.baseId) {
//       return NextResponse.json(
//         { error: "Compte agence sans base associée" },
//         { status: 400 }
//       );
//     }

//     const { searchParams } = new URL(request.url);
//     const search = searchParams.get("search");

//     const baseFilter =
//       session.user.role === "AGENCE"
//         ? { baseId: session.user.baseId ?? "" }
//         : {};

//     const vehicles = await prisma.vehicle.findMany({
//       where: {
//         ...baseFilter,
//         ...(search
//           ? {
//             licensePlate: { contains: search },
//           }
//           : {}),
//       },
//       select: {
//         id: true,
//         licensePlate: true,
//         brandId: true,
//         modelId: true,

//         year: true,
//         color: true,
//         firstRegistrationDate: true,
//         energy: true,
//         doorsCount: true,
//         bodyType: true,
//         realPowerHp: true,
//         fiscalPowerCv: true,
//         gearboxType: true,
//         version: true,
//         registrationCardDate: true,

//         entryDate: true,
//         exitDate: true,
//         createdAt: true,
//         updatedAt: true,

//         client: { select: { id: true, name: true } },
//         base: { select: { id: true, location: true, clientId: true } },

//         brand: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },

//         model: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },

//         invoices: {
//           select: {
//             id: true,
//             invoiceConfirmed: true,
//             status: true,
//             accordNumber: true,
//             dateOfConfirmation: true,
//             statusUpdatedAt: true,
//             workDescription: true,
//             didOrderParts: true,
//             ordersDetails: true,
//             comments: true,
//             createdAt: true,
//             updatedAt: true,
//             photos: { select: { id: true, url: true } },
//             handledBy: { select: { name: true, email: true } },
//             devis: {
//               where: { dev_supprimee: false },
//               select: { dev_id: true, dev_numdevis: true },
//             },
//           },
//           orderBy: { createdAt: "desc" },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//       take: search ? 10 : 100,
//     });

//     return NextResponse.json({ vehicles });
//   } catch (error) {
//     logError("Failed to fetch vehicles", error);
//     return NextResponse.json(
//       { error: "Échec de la récupération des véhicules" },
//       { status: 500 }
//     );
//   }
// }

// // ============================
// // POST /api/vehicles
// // ============================
// export async function POST(request: NextRequest) {
//   try {
//     const session = await auth();

//     if (!session?.user || !["MANAGER", "AGENCE"].includes(session.user.role)) {
//       return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
//     }

//     if (session.user.role === "AGENCE" && !session.user.baseId) {
//       return NextResponse.json(
//         { error: "Compte agence sans base associée" },
//         { status: 400 }
//       );
//     }

//     const body = await request.json();

//     const {
//       licensePlate,
//       brandId,
//       modelId,
//       year,
//       color,
//       clientId,
//       baseId,
//       entryDate,
//       exitDate,

//       firstRegistrationDate,
//       energy,
//       doorsCount,
//       bodyType,
//       realPowerHp,
//       fiscalPowerCv,
//       gearboxType,
//       version,
//       registrationCardDate,
//     } = body;

//     if (!String(licensePlate ?? "").trim()) {
//       return NextResponse.json({ error: "Immatriculation requise" }, { status: 400 });
//     }

//     let finalBaseId: string | null = baseId ? String(baseId) : null;
//     let finalClientId: string | null = clientId ? String(clientId) : null;

//     if (session.user.role === "AGENCE") {
//       finalBaseId = session.user.baseId!;
//       const base = await prisma.base.findUnique({
//         where: { id: finalBaseId },
//         select: { clientId: true },
//       });

//       if (!base) {
//         return NextResponse.json({ error: "Base agence introuvable" }, { status: 400 });
//       }

//       finalClientId = base.clientId;
//     }

//     if (session.user.role === "MANAGER") {
//       if (!String(finalClientId ?? "").trim() || !String(finalBaseId ?? "").trim()) {
//         return NextResponse.json(
//           { error: "Immatriculation, client et agence requis" },
//           { status: 400 }
//         );
//       }
//     }

//     if (year !== undefined && year !== null && year !== "") {
//       const parsedYearCheck = parseOptionalInt(year);
//       if (!parsedYearCheck || parsedYearCheck < 1900 || parsedYearCheck > 2100) {
//         return NextResponse.json(
//           { error: "L'année doit être un nombre valide entre 1900 et 2100" },
//           { status: 400 }
//         );
//       }
//     }

//     if (finalBaseId) {
//       const base = await prisma.base.findUnique({
//         where: { id: String(finalBaseId) },
//         select: { id: true, clientId: true },
//       });

//       if (!base) {
//         return NextResponse.json({ error: "Agence invalide" }, { status: 400 });
//       }

//       if (finalClientId && base.clientId !== String(finalClientId)) {
//         return NextResponse.json(
//           { error: "Cette agence n'appartient pas au client sélectionné" },
//           { status: 400 }
//         );
//       }
//     }

//     const parsedYear = parseOptionalInt(year);
//     const parsedDoorsCount = parseOptionalInt(doorsCount);
//     const parsedRealPowerHp = parseOptionalInt(realPowerHp);
//     const parsedFiscalPowerCv = parseOptionalInt(fiscalPowerCv);

//     const parsedFirstReg = parseOptionalDate(firstRegistrationDate);
//     const parsedRegistrationCard = parseOptionalDate(registrationCardDate);

//     if (firstRegistrationDate && !parsedFirstReg) {
//       return NextResponse.json(
//         { error: "firstRegistrationDate invalide (format date attendu)" },
//         { status: 400 }
//       );
//     }

//     if (registrationCardDate && !parsedRegistrationCard) {
//       return NextResponse.json(
//         { error: "registrationCardDate invalide (format date attendu)" },
//         { status: 400 }
//       );
//     }

//     const vehicle = await prisma.vehicle.create({
//       data: {
//         licensePlate: String(licensePlate).trim(),
//         brandId: brandId || null,
//         modelId: modelId || null,
//         year: parsedYear,
//         color: normalizeOptionalString(color),

//         firstRegistrationDate: parsedFirstReg,
//         energy: energy ?? null,
//         doorsCount: parsedDoorsCount,
//         bodyType: bodyType ?? null,
//         realPowerHp: parsedRealPowerHp,
//         fiscalPowerCv: parsedFiscalPowerCv,
//         gearboxType: gearboxType ?? null,
//         version: normalizeOptionalString(version),
//         registrationCardDate: parsedRegistrationCard,

//         clientId: finalClientId!,
//         baseId: finalBaseId!,

//         entryDate: entryDate ? new Date(entryDate) : new Date(),
//         exitDate: exitDate ? new Date(exitDate) : null,

//         handledById: session.user.id,
//       },
//       include: {
//         client: true,
//         base: { select: { id: true, location: true } },
//         handledBy: { select: { name: true, email: true } },
//       },
//     });

//     return NextResponse.json(vehicle, { status: 201 });
//   } catch (error: any) {
//     if (error?.code === "P2002") {
//       logError("Failed to create vehicle - duplicate license plate", error);
//       return NextResponse.json(
//         { error: "Un véhicule avec cette immatriculation existe déjà" },
//         { status: 409 }
//       );
//     }

//     logError("Failed to create vehicle", error);
//     return NextResponse.json(
//       { error: "Échec de la création du véhicule" },
//       { status: 500 }
//     );
//   }
// }
