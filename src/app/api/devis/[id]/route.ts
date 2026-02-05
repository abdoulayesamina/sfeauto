import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    const devisId = Number(id)
    if (isNaN(devisId)) {
      return NextResponse.json(
        { error: "ID devis invalide" },
        { status: 400 }
      );
    }

    const devis = await prisma.te_devis_dev.findUnique({
      where: {
        dev_id: devisId,
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

    if (!devis) {
      return NextResponse.json(
        { error: "Devis introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(devis, { status: 200 });
  } catch (error) {
    console.error("GET /api/devis/[id] error:", error);

    return NextResponse.json(
      { error: "Erreur lors de la récupération du devis" },
      { status: 500 }
    );
  }
}