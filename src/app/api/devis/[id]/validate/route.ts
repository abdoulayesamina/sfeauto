import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { logError } from "@/src/lib/logger";
import { NextResponse } from "next/server";

function normalizeAccordNumber(v: any): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      select: {
        dev_id: true,
        dev_supprimee: true,
        dev_accordNumber: true,
        dev_intervention: {
          select: {
            int_accordNumber: true,
          },
        },
      },
    });

    if (!current || current.dev_supprimee) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }

    if (current.dev_accordNumber) {
      return NextResponse.json({ error: "Devis déjà validé" }, { status: 409 });
    }

    const interventionAccord = normalizeAccordNumber(current.dev_intervention?.int_accordNumber);

    if (!interventionAccord) {
      return NextResponse.json(
        { error: "Impossible de valider : l’intervention liée n’a pas de numéro d’accord" },
        { status: 400 }
      );
    }

    if (dev_accordNumber !== interventionAccord) {
      return NextResponse.json(
        {
          error: "Numéro d’accord invalide : il doit être identique à celui de l’intervention",
          code: "ACCORD_NUMBER_MISMATCH",
          details: { expected: interventionAccord, provided: dev_accordNumber },
        },
        { status: 409 }
      );
    }

    const exists = await prisma.te_devis_dev.findFirst({
      where: {
        dev_supprimee: false,
        dev_accordNumber,
        dev_id: { not: dev_id },
      },
      select: {
        dev_id: true,
        dev_numdevis: true,
        dev_datecreation: true,
        dev_intervention: {
          select: {
            int_id: true,
            int_status: true,
            int_workDescription: true,
          },
        },
        dev_vehicle: {
          select: {
            veh_licensePlate: true,
            veh_year: true,
            veh_brand: { select: { bra_name: true } },
            veh_model: { select: { mod_name: true } },
          },
        },
        dev_client: { select: { cli_name: true } },
      },
    });

    if (exists) {
      return NextResponse.json(
        {
          error: "Ce numéro d’accord est déjà utilisé",
          code: "ACCORD_NUMBER_ALREADY_EXISTS",
          details: {
            accordNumber: dev_accordNumber,
            conflictType: "devis",
            devisNumber: exists.dev_numdevis,
            interventionId: exists.dev_intervention?.int_id ?? null,
            createdAt: exists.dev_datecreation,
            status: exists.dev_intervention?.int_status ?? null,
            workDescription: exists.dev_intervention?.int_workDescription ?? null,
            vehicle: {
              licensePlate: exists.dev_vehicle?.veh_licensePlate ?? null,
              brand: exists.dev_vehicle?.veh_brand?.bra_name ?? null,
              model: exists.dev_vehicle?.veh_model?.mod_name ?? null,
              year: exists.dev_vehicle?.veh_year ?? null,
              client: exists.dev_client?.cli_name ?? null,
              base: null,
            },
          },
        },
        { status: 409 }
      );
    }

    const updated = await prisma.te_devis_dev.update({
      where: { dev_id },
      data: {
        dev_accordNumber,
        dev_dateAccord: new Date(),
      },
      include: {
        dev_intervention: {
          select: {
            int_id: true,
            int_accordNumber: true,
            int_workDescription: true,
            int_status: true,
            int_dateOfConfirmation: true,
          },
        },
        dev_vehicle: {
          select: {
            veh_id: true,
            veh_licensePlate: true,
            veh_brandId: true,
            veh_modelId: true,
          },
        },
        dev_client: {
          select: {
            cli_id: true,
            cli_name: true,
          },
        },
        articles: true,
      },
    });

    return NextResponse.json({ devis: updated });
  } catch (error) {
    logError("Failed to validate devis", error);
    return NextResponse.json(
      { error: "Échec validation devis" },
      { status: 500 }
    );
  }
}