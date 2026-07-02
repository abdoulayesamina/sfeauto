import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

// Marque une notification précise comme lue (uniquement si elle appartient à l'utilisateur).
export async function PATCH(_request: NextRequest, context: Ctx) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const result = await prisma.notification_not.updateMany({
      where: { not_id: id, not_userId: session.user.id },
      data: { not_isRead: true },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Notification introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Failed to mark notification as read", error);
    return NextResponse.json(
      { error: "Échec de la mise à jour de la notification" },
      { status: 500 }
    );
  }
}
