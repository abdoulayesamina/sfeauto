import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const invoice = await prisma.invoice_inv.findUnique({
      where: { inv_id: id },
      select: { inv_id: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Intervention non trouvée" },
        { status: 404 }
      );
    }

    const history = await prisma.changehistory_chg.findMany({
      where: { chg_invoiceId: id },
      include: {
        chg_user: {
          select: {
            usr_name: true,
            usr_email: true,
          },
        },
      },
      orderBy: { chg_changedAt: "desc" },
    });

    return NextResponse.json(
      history.map((item) => ({
        id: item.chg_id,
        invoiceId: item.chg_invoiceId,
        changedAt: item.chg_changedAt,
        fieldName: item.chg_fieldName,
        oldValue: item.chg_oldValue,
        newValue: item.chg_newValue,
        changeType: item.chg_changeType,
        user: item.chg_user
          ? {
              name: item.chg_user.usr_name,
              email: item.chg_user.usr_email,
            }
          : null,
      }))
    );
  } catch (error: any) {
    logError("Failed to fetch change history", error);
    return NextResponse.json(
      { error: "Échec de la récupération de l'historique" },
      { status: 500 }
    );
  }
}