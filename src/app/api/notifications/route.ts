import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";

export const runtime = "nodejs";

// Liste les notifications de l'utilisateur connecté (l'admin), les plus récentes d'abord.
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification_not.findMany({
        where: { not_userId: session.user.id },
        orderBy: { not_createdAt: "desc" },
        take: 100,
        include: {
          intervention: {
            select: {
              int_id: true,
              int_accordNumber: true,
              int_status: true,
              int_workDescription: true,
            },
          },
        },
      }),
      prisma.notification_not.count({
        where: { not_userId: session.user.id, not_isRead: false },
      }),
    ]);

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    logError("Failed to list notifications", error);
    return NextResponse.json(
      { error: "Échec de récupération des notifications" },
      { status: 500 }
    );
  }
}

// Marque toutes les notifications de l'utilisateur comme lues.
export async function PATCH() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await prisma.notification_not.updateMany({
      where: { not_userId: session.user.id, not_isRead: false },
      data: { not_isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("Failed to mark all notifications as read", error);
    return NextResponse.json(
      { error: "Échec de la mise à jour des notifications" },
      { status: 500 }
    );
  }
}
