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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const dev_id = Number(id);
    if (isNaN(dev_id)) return NextResponse.json({ error: "ID devis invalide" }, { status: 400 });

    const devis = await prisma.te_devis_dev.findUnique({
      where: { dev_id },
      include: {
        invoice: {
          select: { id: true, accordNumber: true, workDescription: true, status: true, dateOfConfirmation: true },
        },
        vehicle: { select: { id: true, licensePlate: true, brand: true, model: true } },
        client: { select: { id: true, name: true } },
        articles: true,
      },
    });

    if (!devis || devis.dev_supprimee) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }

    return NextResponse.json({ devis });
  } catch (error) {
    logError("Failed to fetch devis by id", error);
    return NextResponse.json({ error: "Échec récupération devis" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const dev_id = Number(id);
    if (isNaN(dev_id)) return NextResponse.json({ error: "ID devis invalide" }, { status: 400 });

    const body = await req.json();
    const dev_tva = body?.dev_tva != null ? asNumber(body.dev_tva) : null;
    const items = Array.isArray(body?.items) ? body.items : null;

    if (dev_tva != null && (isNaN(dev_tva) || dev_tva < 0)) {
      return NextResponse.json({ error: "dev_tva invalide" }, { status: 400 });
    }

    const current = await prisma.te_devis_dev.findUnique({
      where: { dev_id },
      include: { articles: true },
    });

    if (!current || current.dev_supprimee) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }

    // TVA effective
    const effectiveDevTva =
      dev_tva != null
        ? dev_tva
        : current.dev_tva != null
          ? Number(current.dev_tva)
          : DEFAULT_TVA_PERCENT;

    let totalHT = 0;
    let totalTVA = 0;
    const lineCreates: any[] = [];

    if (items) {
      if (!items.length) {
        return NextResponse.json({ error: "items requis (au moins 1 ligne)" }, { status: 400 });
      }

      const artIds = items.map((x: any) => asNumber(x?.art_id)).filter((n) => !isNaN(n));
      if (artIds.length !== items.length) {
        return NextResponse.json({ error: "art_id invalide" }, { status: 400 });
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

      for (const it of items) {
        const artId = asNumber(it.art_id);
        const qte = asNumber(it.quantite);

        if (isNaN(qte) || qte <= 0) {
          return NextResponse.json({ error: `Quantité invalide art_id=${artId}` }, { status: 400 });
        }

        const art = articleMap.get(artId)!;
        const baseUnit = asNumber(art.art_price);
        if (isNaN(baseUnit) || baseUnit < 0) {
          return NextResponse.json({ error: `Prix article invalide art_id=${artId}` }, { status: 400 });
        }

        const remise = art.remises;
        let appliedUnit = baseUnit;
        let appliedRemisePct: number | null = null;

        if (remise?.rem_prixremise != null) {
          const p = asNumber(remise.rem_prixremise);
          if (!isNaN(p) && p >= 0) appliedUnit = p;
        } else if (remise?.rem_pourcentage != null) {
          const pct = asNumber(remise.rem_pourcentage);
          if (!isNaN(pct) && pct >= 0) {
            appliedRemisePct = pct;
            appliedUnit = baseUnit * (1 - pct / 100);
          }
        }

        const lineTva = it?.tva != null ? asNumber(it.tva) : effectiveDevTva;
        if (isNaN(lineTva) || lineTva < 0) {
          return NextResponse.json({ error: `TVA invalide art_id=${artId}` }, { status: 400 });
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
          dea_pourcentageremise: appliedRemisePct,
          dea_prixtotalht: lineHT,
        });
      }
    } else {
      // pas de items => on garde totaux actuels
      totalHT = Number(current.dev_totalht ?? 0);
      totalTVA = Number(current.dev_totaltva ?? 0);
    }

    const totalTTC = round2(totalHT + totalTVA);

    const devis = await prisma.$transaction(async (tx) => {
      const updated = await tx.te_devis_dev.update({
        where: { dev_id },
        data: {
          dev_tva: effectiveDevTva,
          dev_totalht: totalHT,
          dev_totaltva: totalTVA,
          dev_totalttc: totalTTC,

          ...(items
            ? {
                articles: {
                  deleteMany: {},        
                  create: lineCreates,  
                },
              }
            : {}),
        },
        include: {
          invoice: {
            select: { id: true, accordNumber: true, workDescription: true, status: true, dateOfConfirmation: true },
          },
          vehicle: { select: { id: true, licensePlate: true, brand: true, model: true } },
          client: { select: { id: true, name: true } },
          articles: true,
        },
      });

      return updated;
    });

    return NextResponse.json({ devis });
  } catch (error) {
    logError("Failed to patch devis", error);
    return NextResponse.json({ error: "Échec de la mise à jour du devis" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const dev_id = Number(id);
    if (isNaN(dev_id)) return NextResponse.json({ error: "ID devis invalide" }, { status: 400 });

    await prisma.te_devis_dev.update({
      where: { dev_id },
      data: { dev_supprimee: true },
    });

    return NextResponse.json({ message: "Devis supprimé" });
  } catch (error) {
    logError("Failed to delete devis", error);
    return NextResponse.json({ error: "Échec suppression devis" }, { status: 500 });
  }
}
