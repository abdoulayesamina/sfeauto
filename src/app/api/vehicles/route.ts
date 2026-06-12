import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { normalizePlate } from "@/src/lib/normalizePlate";

const BODY_TYPES = [
  "BERLINE",
  "SUV",
  "BREAK",
  "COUPE",
  "CABRIOLET",
  "MONOSPACE",
  "PICKUP",
  "UTILITAIRE",
  "AUTRE",
] as const;

const ENERGIES = [
  "GAZOLE",
  "ESSENCE",
  "HYBRIDE",
  "ELECTRIQUE",
  "GPL",
] as const;

const GEARBOX_TYPES = ["BVM", "BVA"] as const;

function parseOptionalInt(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalDate(value: unknown): Date | null {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s.length ? s : null;
}

function parseOptionalEnum<T extends readonly string[]>(
  value: unknown,
  allowed: T
): T[number] | null {
  const normalized = normalizeOptionalString(value);
  if (!normalized) return null;
  return (allowed as readonly string[]).includes(normalized)
    ? (normalized as T[number])
    : null;
}

// ============================
// GET /api/vehicles
// ============================
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["MANAGER", "AGENCE", "MECHANIC", "ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (session.user.role === "AGENCE" && !session.user.baseId) {
      return NextResponse.json(
        { error: "Compte agence sans base associée" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const rawSearch = searchParams.get("search");
    const search = normalizeOptionalString(rawSearch);
    const normalizedSearch = search ? normalizePlate(search) : null;

    const orFilters: Array<Record<string, unknown>> = [];

    if (search) {
      orFilters.push({
        veh_licensePlate: {
          contains: search,
        },
      });

      if (normalizedSearch) {
        orFilters.push({
          veh_normalizedPlate: {
            contains: normalizedSearch,
          },
        });
      }
    }
    
    const vehicles = await prisma.vehicle_veh.findMany({
      where: {
        ...(session.user.role === "AGENCE"
          ? { veh_baseId: session.user.baseId! }
          : {}),
        ...(orFilters.length > 0 ? { OR: orFilters } : {}),
      },
      select: {
        veh_id: true,
        veh_licensePlate: true,
        veh_normalizedPlate: true,
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
        veh_kilometrage: true,

        veh_entryDate: true,
        veh_exitDate: true,
        veh_createdAt: true,
        veh_updatedAt: true,

        veh_client: {
          select: {
            cli_id: true,
            cli_name: true,
            cli_email: true,
            cli_phone: true,
            cli_adresseFacturation: true,
            cli_numClient: true,
            cli_tvaIntraCommunautaire: true,
          },
        },

        veh_base: {
          select: {
            bas_id: true,
            bas_location: true,
            bas_clientId: true,
          },
        },

        veh_brand: {
          select: {
            bra_id: true,
            bra_name: true,
          },
        },

        veh_model: {
          select: {
            mod_id: true,
            mod_name: true,
          },
        },

        veh_handledBy: {
          select: {
            usr_id: true,
            usr_name: true,
            usr_email: true,
          },
        },

        interventions: {
          where: {
            int_supprimee: false,
          },
          select: {
            int_id: true,
            int_clientId: true,
            int_baseId: true,
            int_client: {
              select: {
                cli_id: true,
                cli_name: true,
              },
            },
            int_base: {
              select: {
                bas_id: true,
                bas_location: true,
              },
            },
            int_accordNumber: true,
            int_dateOfConfirmation: true,
            int_interventionConfirmed: true,
            int_kilometrage: true,
            int_status: true,
            int_statusUpdatedAt: true,
            int_workDescription: true,
            int_didOrderParts: true,
            int_ordersDetails: true,
            int_comments: true,
            int_createdAt: true,
            int_updatedAt: true,

            int_handledBy: {
              select: {
                usr_id: true,
                usr_name: true,
                usr_email: true,
              },
            },

            photos: {
              select: {
                itp_id: true,
                itp_url: true,
                itp_blobName: true,
                itp_contentType: true,
                itp_size: true,
                itp_createdAt: true,
              },
            },

            devis: {
              select: {
                dev_id: true,
                dev_numdevis: true,
                dev_datecreation: true,
                dev_totalht: true,
                dev_totaltva: true,
                dev_totalttc: true,
                dev_tva: true,
                dev_supprimee: true,
                dev_accordNumber: true,
                dev_dateAccord: true,
              },
            },

            int_vehicle: {
              select: {
                veh_id: true,
                veh_licensePlate: true,
                veh_brand: {
                  select: {
                    bra_name: true,
                  },
                },
                veh_model: {
                  select: {
                    mod_name: true,
                  },
                },
                veh_year: true,
                veh_color: true,
                veh_kilometrage: true,
              },
            },
          },
          orderBy: {
            int_createdAt: "desc",
          },
        },

        devis: {
          where: {
            dev_supprimee: false,
          },
          select: {
            dev_id: true,
            dev_numdevis: true,
            dev_intervention_id: true,
            dev_datecreation: true,
            dev_totalht: true,
            dev_totaltva: true,
            dev_totalttc: true,
            dev_tva: true,
            dev_accordNumber: true,
            dev_dateAccord: true,
          },
          orderBy: {
            dev_datecreation: "desc",
          },
        },
      },
      orderBy: {
        veh_createdAt: "desc",
      },
      // take: search ? 20 : 100,
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

    if (!session?.user || !["MANAGER", "AGENCE", "MECHANIC"].includes(session.user.role)) {
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
      veh_kilometrage: kilometrage,
      veh_energy: energy,
      veh_doorsCount: doorsCount,
      veh_bodyType: bodyType,
      veh_realPowerHp: realPowerHp,
      veh_fiscalPowerCv: fiscalPowerCv,
      veh_gearboxType: gearboxType,
      veh_version: version,
      veh_registrationCardDate: registrationCardDate,
    } = body;

    if (!String(licensePlate ?? "").trim()) {
      return NextResponse.json(
        { error: "Immatriculation requise" },
        { status: 400 }
      );
    }

    const cleanPlate = String(licensePlate).trim();

    let finalBaseId = normalizeOptionalString(baseId);
    let finalClientId = normalizeOptionalString(clientId);

    if (session.user.role === "AGENCE") {
      finalBaseId = session.user.baseId!;

      const base = await prisma.base_bas.findUnique({
        where: { bas_id: finalBaseId },
        select: {
          bas_id: true,
          bas_clientId: true,
        },
      });

      if (!base) {
        return NextResponse.json(
          { error: "Base agence introuvable" },
          { status: 400 }
        );
      }

      finalClientId = base.bas_clientId;
    }

    if (session.user.role === "MANAGER") {
      if (!finalBaseId || !finalClientId) {
        return NextResponse.json(
          { error: "Client et agence requis" },
          { status: 400 }
        );
      }

      const base = await prisma.base_bas.findUnique({
        where: { bas_id: finalBaseId },
        select: {
          bas_id: true,
          bas_clientId: true,
        },
      });

      if (!base) {
        return NextResponse.json(
          { error: "Agence introuvable" },
          { status: 400 }
        );
      }

      if (base.bas_clientId !== finalClientId) {
        return NextResponse.json(
          { error: "Cette agence n'appartient pas au client sélectionné" },
          { status: 400 }
        );
      }
    }

    const parsedBodyType = parseOptionalEnum(bodyType, BODY_TYPES);
    const parsedEnergy = parseOptionalEnum(energy, ENERGIES);
    const parsedGearboxType = parseOptionalEnum(gearboxType, GEARBOX_TYPES);

    if (normalizeOptionalString(bodyType) && !parsedBodyType) {
      return NextResponse.json(
        { error: "Type de carrosserie invalide" },
        { status: 400 }
      );
    }

    if (normalizeOptionalString(energy) && !parsedEnergy) {
      return NextResponse.json(
        { error: "Type d'énergie invalide" },
        { status: 400 }
      );
    }

    if (normalizeOptionalString(gearboxType) && !parsedGearboxType) {
      return NextResponse.json(
        { error: "Type de boîte invalide" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle_veh.create({
      data: {
        veh_licensePlate: cleanPlate,
        veh_normalizedPlate: normalizePlate(cleanPlate),

        veh_brandId: normalizeOptionalString(brandId),
        veh_modelId: normalizeOptionalString(modelId),

        veh_year: parseOptionalInt(year),
        veh_color: normalizeOptionalString(color),
        veh_version: normalizeOptionalString(version),
        veh_kilometrage: normalizeOptionalString(kilometrage),

        veh_bodyType: parsedBodyType,
        veh_gearboxType: parsedGearboxType,
        veh_energy: parsedEnergy,

        veh_firstRegistrationDate: parseOptionalDate(firstRegistrationDate),
        veh_doorsCount: parseOptionalInt(doorsCount),
        veh_realPowerHp: parseOptionalInt(realPowerHp),
        veh_fiscalPowerCv: parseOptionalInt(fiscalPowerCv),
        veh_registrationCardDate: parseOptionalDate(registrationCardDate),

        veh_clientId: finalClientId!,
        veh_baseId: finalBaseId!,

        veh_entryDate: entryDate ? new Date(entryDate) : new Date(),
        veh_exitDate: exitDate ? new Date(exitDate) : null,

        veh_handledById: session.user.id,
      },
      include: {
        veh_client: {
          select: {
            cli_id: true,
            cli_name: true,
          },
        },
        veh_base: {
          select: {
            bas_id: true,
            bas_location: true,
          },
        },
        veh_brand: {
          select: {
            bra_id: true,
            bra_name: true,
          },
        },
        veh_model: {
          select: {
            mod_id: true,
            mod_name: true,
          },
        },
        veh_handledBy: {
          select: {
            usr_id: true,
            usr_name: true,
            usr_email: true,
          },
        },
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

//         interventions: {
//           select: {
//             id: true,
//             interventionConfirmed: true,
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
