import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { DEFAULT_TVA_PERCENT } from "@/src/utils/constants/tva";
import { NextResponse } from "next/server";

/**
 * Body attendu:
 * {
 *   invoiceId: string,
 *   dev_tva?: number, // TVA par défaut du devis (optionnel)
 *   items: Array<{
 *     art_id: number,
 *     quantite: number,
 *     tva?: number,           // TVA ligne optionnelle
 *     reference?: string,     // optionnel
 *     designation?: string    // optionnel (sinon art_name)
 *   }>
 * }
 */

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

    if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const invoiceId: string | undefined = body?.invoiceId;
    const devTvaDefault = body?.dev_tva != null ? asNumber(body.dev_tva) : DEFAULT_TVA_PERCENT;
    const items = Array.isArray(body?.items) ? body.items : [];

    if (!invoiceId || typeof invoiceId !== "string") {
      return NextResponse.json({ error: "invoiceId requis" }, { status: 400 });
    }
    if (!items.length) {
      return NextResponse.json({ error: "items requis (au moins 1 ligne)" }, { status: 400 });
    }
    if (devTvaDefault != null && (isNaN(devTvaDefault) || devTvaDefault < 0)) {
      return NextResponse.json({ error: "dev_tva invalide" }, { status: 400 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        vehicle: {
          include: { client: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Intervention (Invoice) introuvable" }, { status: 404 });
    }

    const vehicle = invoice.vehicle;
    const client = invoice.vehicle?.client;

    if (!vehicle || !client) {
      return NextResponse.json({ error: "Véhicule/Client introuvable pour cette intervention" }, { status: 400 });
    }

    const artIds = items.map((x: any) => asNumber(x?.art_id)).filter((n) => !isNaN(n));
    if (artIds.length !== items.length) {
      return NextResponse.json({ error: "art_id invalide dans items" }, { status: 400 });
    }

    const articles = await prisma.te_article_art.findMany({
      where: { art_id: { in: artIds } },
      include: { remises: true },
    });

    const articleMap = new Map<number, (typeof articles)[number]>();
    for (const a of articles) articleMap.set(a.art_id, a);

    for (const artId of artIds) {
      if (!articleMap.has(artId)) {
        return NextResponse.json({ error: `Article introuvable: art_id=${artId}` }, { status: 404 });
      }
    }

const existingDevis = await prisma.te_devis_dev.findFirst({
  where: {
    dev_invoice_id: invoiceId,
    dev_supprimee: false,
  },
  select: { dev_id: true, dev_numdevis: true },
});

if (existingDevis) {
  return NextResponse.json(
    { error: `Un devis existe déjà pour cette intervention (${existingDevis.dev_numdevis})` },
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
        return NextResponse.json({ error: `Quantité invalide pour art_id=${artId}` }, { status: 400 });
      }

      const art = articleMap.get(artId)!;
      const baseUnit = asNumber(art.art_price); 
      if (isNaN(baseUnit) || baseUnit < 0) {
        return NextResponse.json({ error: `Prix article invalide pour art_id=${artId}` }, { status: 400 });
      }

      const remise = art.remises; 
      let appliedUnit = baseUnit;
      let appliedRemisePct: number | null = null;

      // si rem_prixremise existe -> prix unitaire remisé
      // sinon si rem_pourcentage existe -> appliquer %
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

      // TVA ligne: priorité item.tva -> dev_tva -> 0
      const lineTva =
        it?.tva != null
          ? asNumber(it.tva)
          : devTvaDefault != null
            ? devTvaDefault
            : 0;

      if (isNaN(lineTva) || lineTva < 0) {
        return NextResponse.json({ error: `TVA invalide pour art_id=${artId}` }, { status: 400 });
      }

      const lineHT = round2(appliedUnit * qte);
      const lineTVA = round2(lineHT * (lineTva / 100));

      totalHT += lineHT;
      totalTVA += lineTVA;

      lineCreates.push({
        dea_art_id: artId,
        dea_art_designation: (it?.designation && String(it.designation).trim()) || art.art_name,
        dea_art_reference: it?.reference ? String(it.reference) : null,
        dea_prixunitaire: appliedUnit,             
        dea_quantite: Math.trunc(qte),
        dea_tva: lineTva,
        dea_pourcentageremise: appliedRemisePct,     // si remise en %
        dea_prixtotalht: lineHT,
      });
    }

    const totalTTC = round2(totalHT + totalTVA);

    // 4) Créer devis + lignes en transaction
    const devNum = await generateDevisNumber();

    const result = await prisma.$transaction(async (tx) => {
      const devis = await tx.te_devis_dev.create({
        data: {
          dev_cli_id: client.id,
          dev_veh_id: vehicle.id,
          dev_invoice_id: invoice.id,
          dev_user: session.user.id, // user qui crée
          dev_adressefacturation: client.cli_adresseFacturation ?? null,
          dev_numdevis: devNum,
          dev_totalht: totalHT,
          dev_totaltva: totalTVA,
          dev_totalttc: totalTTC,
          dev_tva: devTvaDefault,
          dev_supprimee: false,
          // dev_accordNumber / dev_dateAccord restent NULL => non validé
          articles: {
            create: lineCreates,
          },
        },
        include: {
          articles: true,
        },
      });

      return devis;
    });

    return NextResponse.json({ devis: result }, { status: 201 });
  } catch (error) {
    logError("Failed to create devis from invoice", error);
    return NextResponse.json({ error: "Échec de la création du devis" }, { status: 500 });
  }
}


export async function GET() {
  try {
    const devis = await prisma.te_devis_dev.findMany({
      where: {
        dev_supprimee: false,
      },
      orderBy: {
        dev_datecreation: "desc",
      },
      include: {
        client: true,
        vehicle: true,
        invoice: true,
        user: true,
        articles: {
          include: {
            article: {
              include: {
                collection: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      { devis },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/devis error:", error);

    return NextResponse.json(
      { error: "Erreur lors de la récupération des devis" },
      { status: 500 }
    );
  }
}