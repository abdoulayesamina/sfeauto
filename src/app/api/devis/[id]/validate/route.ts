import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { logError } from "@/src/lib/logger";
import { NextResponse } from "next/server";

function normalizeAccordNumber(v: any): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const dev_id = Number(id);
    if (isNaN(dev_id)) {
      return NextResponse.json({ error: "ID devis invalide" }, { status: 400 });
    }

    const body = await req.json();
    const dev_accordNumber = normalizeAccordNumber(body?.dev_accordNumber);

    if (!dev_accordNumber) {
      return NextResponse.json({ error: "dev_accordNumber requis" }, { status: 400 });
    }

    const current = await prisma.te_devis_dev.findUnique({
      where: { dev_id },
      select: { dev_id: true, dev_supprimee: true, dev_accordNumber: true },
    });

    if (!current || current.dev_supprimee) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }

    // ✅ déjà validé
    if (current.dev_accordNumber) {
      return NextResponse.json({ error: "Devis déjà validé" }, { status: 409 });
    }

    // ✅ OPTIONNEL: empêcher doublons d'accordNumber sur d'autres devis
    // (recommandé si tu veux que ça soit unique)
    const exists = await prisma.te_devis_dev.findFirst({
      where: { dev_supprimee: false, dev_accordNumber },
      select: { dev_id: true },
    });
    if (exists) {
      return NextResponse.json({ error: "Ce numéro d’accord est déjà utilisé" }, { status: 409 });
    }

    const updated = await prisma.te_devis_dev.update({
      where: { dev_id },
      data: {
        dev_accordNumber,
        dev_dateAccord: new Date(),
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

    return NextResponse.json({ devis: updated });
  } catch (error) {
    logError("Failed to validate devis", error);
    return NextResponse.json({ error: "Échec validation devis" }, { status: 500 });
  }
}
