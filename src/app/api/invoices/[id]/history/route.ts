import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // <-- Important, await ici

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifier la facture
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Intervention non trouvée' },
        { status: 404 }
      );
    }

    // Historique
    const history = await prisma.changeHistory.findMany({
      where: { invoiceId: id },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { changedAt: 'desc' },
    });

    return NextResponse.json(history);
  } catch (error: any) {
    logError('Failed to fetch change history', error);
    return NextResponse.json(
      { error: "Échec de la récupération de l'historique" },
      { status: 500 }
    );
  }
}

