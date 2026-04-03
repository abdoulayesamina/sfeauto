import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { DEFAULT_TVA_PERCENT } from "@/src/utils/constants/tva";
import { NextResponse } from "next/server";

function asNumber(v: any): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

async function generateDevisNumber(): Promise<string> {
  const year = new Date().getFullYear();

  for (let i = 0; i < 5; i++) {
    const rnd = Math.floor(100000 + Math.random() * 900000);
    const num = `DV-${year}-${rnd}`;

    const exists = await prisma.te_devis_dev.findUnique({
      where: { dev_numdevis: num },
      select: { dev_id: true },
    });

    if (!exists) return num;
  }

  throw new Error("Impossible de générer un numéro de devis unique");
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["MANAGER", "ADMIN", "MECHANIC"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Compatibilité front existant :
    // on accepte invoiceId mais il correspond désormais à int_id
    const interventionId: string | undefined =
      body?.interventionId ?? body?.invoiceId;

    const devTvaDefault =
      body?.dev_tva != null ? asNumber(body.dev_tva) : DEFAULT_TVA_PERCENT;

    const items = Array.isArray(body?.items) ? body.items : [];

    if (!interventionId || typeof interventionId !== "string") {
      return NextResponse.json(
        { error: "interventionId requis" },
        { status: 400 }
      );
    }

    if (!items.length) {
      return NextResponse.json(
        { error: "items requis (au moins 1 ligne)" },
        { status: 400 }
      );
    }

    if (devTvaDefault != null && (isNaN(devTvaDefault) || devTvaDefault < 0)) {
      return NextResponse.json({ error: "dev_tva invalide" }, { status: 400 });
    }

    const intervention = await prisma.intervention_int.findUnique({
      where: { int_id: interventionId },
      include: {
        int_vehicle: {
          include: {
            veh_client: true,
          },
        },
      },
    });

    if (!intervention) {
      return NextResponse.json(
        { error: "Intervention introuvable" },
        { status: 404 }
      );
    }

    const vehicle = intervention.int_vehicle;
    const client = intervention.int_vehicle?.veh_client;

    if (!vehicle || !client) {
      return NextResponse.json(
        { error: "Véhicule/Client introuvable pour cette intervention" },
        { status: 400 }
      );
    }

    const artIds = items
      .map((x: any) => asNumber(x?.art_id))
      .filter((n: number) => !Number.isNaN(n));

    if (artIds.length !== items.length) {
      return NextResponse.json(
        { error: "art_id invalide dans items" },
        { status: 400 }
      );
    }

    const articles = await prisma.article_art.findMany({
      where: { art_id: { in: artIds } },
      include: { remises: true },
    });

    const articleMap = new Map<number, (typeof articles)[number]>();
    for (const a of articles) articleMap.set(a.art_id, a);

    for (const artId of artIds) {
      if (!articleMap.has(artId)) {
        return NextResponse.json(
          { error: `Article introuvable: art_id=${artId}` },
          { status: 404 }
        );
      }
    }

    const existingDevis = await prisma.te_devis_dev.findFirst({
      where: {
        dev_intervention_id: interventionId,
        dev_supprimee: false,
      },
      select: { dev_id: true, dev_numdevis: true },
    });

    if (existingDevis) {
      return NextResponse.json(
        {
          error: `Un devis existe déjà pour cette intervention (${existingDevis.dev_numdevis})`,
        },
        { status: 409 }
      );
    }

    const lineCreates: any[] = [];
    let totalHT = 0;
    let totalTVA = 0;

    for (const it of items) {
      const artId = asNumber(it.art_id);
      const qte = asNumber(it.quantite);

      if (isNaN(qte) || qte <= 0) {
        return NextResponse.json(
          { error: `Quantité invalide pour art_id=${artId}` },
          { status: 400 }
        );
      }

      const art = articleMap.get(artId)!;
      const baseUnit = asNumber(art.art_price);

      if (isNaN(baseUnit) || baseUnit < 0) {
        return NextResponse.json(
          { error: `Prix article invalide pour art_id=${artId}` },
          { status: 400 }
        );
      }

      const remise = art.remises;
      let appliedUnit = baseUnit;
      let appliedRemisePct: number | null = null;

      if (remise?.rem_prixremise != null) {
        const p = asNumber(remise.rem_prixremise);
        if (!isNaN(p) && p >= 0) {
          appliedUnit = p;
        }
      } else if (remise?.rem_pourcentage != null) {
        const pct = asNumber(remise.rem_pourcentage);
        if (!isNaN(pct) && pct >= 0) {
          appliedRemisePct = pct;
          appliedUnit = baseUnit * (1 - pct / 100);
        }
      }

      const lineTva =
        it?.tva != null
          ? asNumber(it.tva)
          : devTvaDefault != null
            ? devTvaDefault
            : 0;

      if (isNaN(lineTva) || lineTva < 0) {
        return NextResponse.json(
          { error: `TVA invalide pour art_id=${artId}` },
          { status: 400 }
        );
      }

      const lineHT = round2(appliedUnit * qte);
      const lineTVA = round2(lineHT * (lineTva / 100));

      totalHT += lineHT;
      totalTVA += lineTVA;

      lineCreates.push({
        dea_art_id: artId,
        dea_art_designation:
          (it?.designation && String(it.designation).trim()) || art.art_name,
        dea_art_reference: it?.reference ? String(it.reference) : null,
        dea_prixunitaire: appliedUnit,
        dea_quantite: Math.trunc(qte),
        dea_tva: lineTva,
        dea_pourcentageremise: appliedRemisePct,
        dea_prixtotalht: lineHT,
      });
    }

    totalHT = round2(totalHT);
    totalTVA = round2(totalTVA);
    const totalTTC = round2(totalHT + totalTVA);

    const devNum = await generateDevisNumber();

    const result = await prisma.$transaction(async (tx) => {
      const devis = await tx.te_devis_dev.create({
        data: {
          dev_cli_id: client.cli_id,
          dev_veh_id: vehicle.veh_id,
          dev_intervention_id: intervention.int_id,
          dev_user_id: session.user.id,
          dev_adressefacturation: client.cli_adresseFacturation ?? null,
          dev_numdevis: devNum,
          dev_totalht: totalHT,
          dev_totaltva: totalTVA,
          dev_totalttc: totalTTC,
          dev_tva: devTvaDefault,
          dev_supprimee: false,
          articles: {
            create: lineCreates,
          },
        },
        include: {
          articles: true,
          dev_intervention: {
            select: {
              int_id: true,
              int_accordNumber: true,
              int_status: true,
            },
          },
          dev_vehicle: {
            select: {
              veh_id: true,
              veh_licensePlate: true,
            },
          },
          dev_client: {
            select: {
              cli_id: true,
              cli_name: true,
            },
          },
        },
      });

      return devis;
    });

    return NextResponse.json({ devis: result }, { status: 201 });
  } catch (error) {
    logError("Failed to create devis from intervention", error);
    return NextResponse.json(
      { error: "Échec de la création du devis" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["MANAGER", "ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const devis = await prisma.te_devis_dev.findMany({
      where: { dev_supprimee: false },
      orderBy: { dev_id: "desc" },
      include: {
        dev_intervention: {
          select: {
            int_id: true,
            int_accordNumber: true,
            int_dateOfConfirmation: true,
            int_workDescription: true,
            int_status: true,
          },
        },
        dev_vehicle: {
          select: {
            veh_id: true,
            veh_licensePlate: true,
            veh_brandId: true,
            veh_modelId: true,
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
          },
        },
        dev_client: {
          select: {
            cli_id: true,
            cli_name: true,
          },
        },
        dev_user: {
          select: {
            usr_id: true,
            usr_name: true,
            usr_email: true,
          },
        },
        articles: {
          include: {
            dea_article: {
              select: {
                art_id: true,
                art_name: true,
                art_reference: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ devis });
  } catch (error) {
    logError("Failed to list devis", error);
    return NextResponse.json(
      { error: "Échec récupération devis" },
      { status: 500 }
    );
  }
}