import { prisma } from "@/src/lib/prisma";
import { getIO } from "@/src/lib/socketServer";
import { logError } from "@/src/lib/logger";
import type { NotificationType } from "@/generated/prisma";

type NotifyAdminsInput = {
  type: NotificationType;
  title: string;
  message: string;
  interventionId?: string | null;
  url?: string | null;
  /** N'envoie pas de notification à cet utilisateur (ex: l'auteur de l'action). */
  excludeUserId?: string | null;
};

/**
 * Crée une notification en base pour chaque administrateur puis l'émet en temps réel
 * dans sa room socket (`user:<id>`). Ne fait jamais échouer l'action appelante :
 * toute erreur est loggée et avalée.
 */
export async function notifyAdmins(input: NotifyAdminsInput): Promise<void> {
  const { type, title, message, interventionId = null, url = null, excludeUserId = null } = input;

  try {
    const admins = await prisma.user_usr.findMany({
      where: {
        usr_role: "ADMIN",
        ...(excludeUserId ? { usr_id: { not: excludeUserId } } : {}),
      },
      select: { usr_id: true },
    });

    if (admins.length === 0) return;

    const io = getIO();

    for (const admin of admins) {
      const notification = await prisma.notification_not.create({
        data: {
          not_title: title,
          not_message: message,
          not_type: type,
          not_url: url,
          not_userId: admin.usr_id,
          not_interventionId: interventionId,
        },
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
      });

      io?.to(`user:${admin.usr_id}`).emit("notification", notification);
    }
  } catch (error) {
    logError("Failed to notify admins", error);
  }
}
