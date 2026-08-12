import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { normalizePlate } from "@/src/lib/normalizePlate";
import { adaptLegacyIntervention } from "@/src/utils/constants/intervention-status";

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

    // La pagination ne s'active que si l'appelant la demande explicitement
    // (query param présent) — sans ça, on garde l'ancien comportement
    // "tout renvoyer" pour ne pas casser silencieusement les appelants qui
    // n'ont pas encore été migrés vers la pagination serveur.
    const isPaginated = searchParams.has("page") || searchParams.has("pageSize");
    const page = Math.max(1, parseOptionalInt(searchParams.get("page")) ?? 1);
    const pageSize = Math.min(
      100,
      Math.max(1, parseOptionalInt(searchParams.get("pageSize")) ?? 20)
    );
    const clientIdParam = normalizeOptionalString(searchParams.get("clientId"));
    const agenceIdParam = normalizeOptionalString(searchParams.get("agenceId"));
    const statutParam = normalizeOptionalString(searchParams.get("statut"));
    const accordSearchParam = normalizeOptionalString(searchParams.get("accordSearch"));

    // Recherche par n° d'accord : mode exclusif, comme côté front — quand elle
    // est active, on ignore volontairement client/agence/statut.
    const interventionsFilter: any = accordSearchParam
      ? {
          some: {
            int_supprimee: false,
            int_accordNumber: { contains: accordSearchParam },
          },
        }
      : statutParam && statutParam !== "all"
        ? statutParam === "SANS_INTERVENTION"
          ? { none: { int_supprimee: false } }
          : statutParam === "ANNULEE"
            ? {
                some: {
                  int_supprimee: false,
                  OR: [{ int_status: "CANCELLED" }, { int_annulee: true }],
                },
              }
            : statutParam === "REFUSE"
              ? {
                  // Pas d'exclusion int_annulee ici : la carte de stats
                  // "Refusées" (14) ne l'exclut pas non plus — une
                  // intervention à la fois refusée et annulée doit compter
                  // (et donc apparaître) dans les deux filtres, sans quoi
                  // liste et carte affichent des totaux différents.
                  some: {
                    int_supprimee: false,
                    OR: [{ int_status: "REFUSED" }, { int_accordNumber: "REFUSE" }],
                  },
                }
              : { some: { int_supprimee: false, int_status: statutParam as any } }
        : undefined;

    // Filtre "scope" (client/agence/recherche) commun à la liste et aux stats,
    // SANS le filtre par statut : les stats des cartes doivent rester stables
    // quel que soit l'onglet de statut actif, seule la liste de véhicules doit
    // se réduire.
    const scopeWhere = {
      ...(session.user.role === "AGENCE"
        ? { veh_baseId: session.user.baseId! }
        : {}),
      ...(orFilters.length > 0 ? { OR: orFilters } : {}),
      ...(!accordSearchParam && clientIdParam ? { veh_clientId: clientIdParam } : {}),
      ...(!accordSearchParam && agenceIdParam ? { veh_baseId: agenceIdParam } : {}),
    };

    const where = {
      ...scopeWhere,
      ...(interventionsFilter ? { interventions: interventionsFilter } : {}),
    };

    const [vehicles, total, statusGroups, annuleesCount, refuseesCount, excludedInterventionsCount, sansInterventionCount] = await Promise.all([
      prisma.vehicle_veh.findMany({
      where,
      ...(isPaginated ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
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
        veh_absent: true,
        veh_dateAbsence: true,

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
            int_annulee: true,
            int_dateAnnulation: true,

            int_handledBy: {
              select: {
                usr_id: true,
                usr_name: true,
                usr_email: true,
              },
            },

            // Les photos et le détail complet du devis ne sont jamais lus
            // depuis cette liste (chaque écran de détail les refetch lui-même
            // via useInterventionPhotos / DevisApercu) — on ne garde que
            // l'identifiant du devis pour savoir s'il en existe déjà un.
            devis: {
              select: {
                dev_id: true,
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
      }),
      prisma.vehicle_veh.count({ where }),
      // Stats calculées sur le scope actuel (client/agence/recherche) mais
      // SANS le filtre par statut, pour que les cartes ne bougent pas quand on
      // clique sur un onglet de statut — seule la liste de véhicules ci-dessus
      // (qui utilise `where`, avec le statut) doit se réduire.
      //
      // L'annulation (cancel/route.ts) et le refus (accordNumber="REFUSE",
      // [id]/route.ts) ne remettent JAMAIS int_status à jour : une
      // intervention annulée en cours de réparation reste avec
      // int_status="FIXING_STARTED" en base. Sans cette exclusion, elle
      // serait comptée à la fois ici (sous son ancien statut) ET dans
      // annuleesCount/refuseesCount ci-dessous, gonflant "Total" et les
      // compteurs par statut.
      //
      // Attention piège SQL : `int_accordNumber` est nullable. Un simple
      // `NOT: { OR: [..., { int_accordNumber: "REFUSE" }] }` est FAUX pour
      // les lignes où int_accordNumber est NULL — en logique à 3 valeurs SQL,
      // `NULL = 'REFUSE'` vaut NULL (ni vrai ni faux), donc le OR global vaut
      // NULL pour ces lignes et le NOT(NULL) vaut aussi NULL : la ligne
      // disparaît alors de la requête (ni incluse, ni exclue). Vérifié
      // empiriquement sur la base réelle (voir discussion) : ça faisait
      // disparaître ~24 interventions du décompte. On gère donc le cas NULL
      // explicitement via un OR séparé plutôt que de nier un OR global.
      prisma.intervention_int.groupBy({
        by: ["int_status"],
        where: {
          int_supprimee: false,
          int_vehicle: scopeWhere,
          int_annulee: false,
          int_status: { notIn: ["CANCELLED", "REFUSED"] },
          OR: [{ int_accordNumber: null }, { int_accordNumber: { not: "REFUSE" } }],
        },
        _count: true,
      }),
      prisma.intervention_int.count({
        where: { int_supprimee: false, OR: [{ int_status: "CANCELLED" }, { int_annulee: true }], int_vehicle: scopeWhere },
      }),
      prisma.intervention_int.count({
        where: {
          int_supprimee: false,
          OR: [{ int_status: "REFUSED" }, { int_accordNumber: "REFUSE" }],
          int_vehicle: scopeWhere,
        },
      }),
      // Total EXACT des interventions annulées/refusées, pour le calcul du
      // "Total" ci-dessous : contrairement à `annuleesCount + refuseesCount`,
      // ceci ne compte PAS deux fois une intervention qui serait à la fois
      // annulée ET refusée (cas réel trouvé en base) — count() sur un OR ne
      // double-compte jamais une même ligne.
      prisma.intervention_int.count({
        where: {
          int_supprimee: false,
          int_vehicle: scopeWhere,
          OR: [
            { int_status: "CANCELLED" },
            { int_annulee: true },
            { int_status: "REFUSED" },
            { int_accordNumber: "REFUSE" },
          ],
        },
      }),
      // "Sans intervention" compte des VÉHICULES (pas des interventions,
      // contrairement à toutes les autres cartes) : les véhicules du scope
      // actuel qui n'ont aucune intervention non supprimée.
      prisma.vehicle_veh.count({
        where: { ...scopeWhere, interventions: { none: { int_supprimee: false } } },
      }),
    ]);

    const stats = {
      total: statusGroups.reduce((sum, g) => sum + g._count, 0) + excludedInterventionsCount,
      enCours:
        statusGroups.find((g) => g.int_status === "FIXING_STARTED")?._count ?? 0,
      terminees:
        statusGroups.find((g) => g.int_status === "FIXING_FINISHED")?._count ?? 0,
      attente:
        statusGroups.find((g) => g.int_status === "WAITING_FOR_PARTS")?._count ?? 0,
      attenteAccord:
        statusGroups.find((g) => g.int_status === "WAITING_FOR_APPROVAL")?._count ?? 0,
      annulees: annuleesCount,
      refusees: refuseesCount,
      sansIntervention: sansInterventionCount,
    };

    const adaptedVehicles = vehicles.map((v) => ({
      ...v,
      interventions: (v.interventions ?? []).map(adaptLegacyIntervention),
    }));

    return NextResponse.json({
      vehicles: adaptedVehicles,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      stats,
    });
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
