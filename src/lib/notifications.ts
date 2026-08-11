import { prisma } from "@/src/lib/prisma";
import { getIO } from "@/src/lib/socketServer";
import { logError } from "@/src/lib/logger";
import { sendMail } from "@/src/lib/mail";
import { getStatusLabel } from "@/src/utils/constants/status-labels";
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

  await notifyByEmail({ title, message, interventionId });
}

function formatDate(value: Date | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function row(label: string, value: string | null | undefined): string {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:4px 12px 4px 0;color:#666;white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:4px 0;color:#111;">${escapeHtml(String(value))}</td>
    </tr>
  `;
}

type InterventionEmailInput = {
  title: string;
  message: string;
  interventionId?: string | null;
};

/**
 * Construit le sujet + HTML enrichi (infos intervention + véhicule) partagés
 * par tous les emails liés à une intervention (notification admin,
 * notification facturation, etc.).
 */
async function buildInterventionEmailContent(
  input: InterventionEmailInput
): Promise<{ subject: string; html: string }> {
  const intervention = input.interventionId
    ? await prisma.intervention_int.findUnique({
        where: { int_id: input.interventionId },
        include: {
          int_handledBy: { select: { usr_name: true, usr_email: true } },
          int_vehicle: {
            include: {
              veh_brand: { select: { bra_name: true } },
              veh_model: { select: { mod_name: true } },
              veh_client: { select: { cli_name: true } },
              veh_base: { select: { bas_location: true } },
            },
          },
        },
      })
    : null;

  const interventionSection = intervention
    ? `
      <h3 style="margin:24px 0 8px;font-size:15px;">Intervention</h3>
      <table style="border-collapse:collapse;font-size:13px;">
        ${row("Statut", getStatusLabel(intervention.int_status))}
        ${row("N° d'accord", intervention.int_accordNumber)}
        ${row("Description", intervention.int_workDescription)}
        ${row("Pièces commandées", intervention.int_didOrderParts ? "Oui" : "Non")}
        ${row("Détails commande", intervention.int_ordersDetails)}
        ${row("Commentaires", intervention.int_comments)}
        ${row("Kilométrage", intervention.int_kilometrage)}
        ${row("Confirmée le", intervention.int_dateOfConfirmation ? formatDate(intervention.int_dateOfConfirmation) : null)}
        ${row("Créée le", formatDate(intervention.int_createdAt))}
        ${row("Dernière mise à jour", formatDate(intervention.int_updatedAt))}
        ${row("Annulée", intervention.int_annulee ? "Oui" : null)}
        ${row("Prise en charge par", intervention.int_handledBy?.usr_name)}
      </table>
    `
    : "";

  const vehicle = intervention?.int_vehicle;
  const vehicleSection = vehicle
    ? `
      <h3 style="margin:24px 0 8px;font-size:15px;">Véhicule</h3>
      <table style="border-collapse:collapse;font-size:13px;">
        ${row("Plaque", vehicle.veh_licensePlate)}
        ${row("Marque / Modèle", [vehicle.veh_brand?.bra_name, vehicle.veh_model?.mod_name].filter(Boolean).join(" "))}
        ${row("Année", vehicle.veh_year != null ? String(vehicle.veh_year) : null)}
        ${row("Couleur", vehicle.veh_color)}
        ${row("Kilométrage véhicule", vehicle.veh_kilometrage)}
        ${row("Client", vehicle.veh_client?.cli_name)}
        ${row("Agence", vehicle.veh_base?.bas_location)}
        ${row("Absent", vehicle.veh_absent ? "Oui" : null)}
      </table>
    `
    : "";

  return {
    subject: `[SFE Auto] ${input.title}`,
    html: `
      <div style="font-family: sans-serif; font-size: 14px; color: #111;">
        <h2 style="margin: 0 0 8px;">${input.title}</h2>
        <p style="margin: 0 0 8px;">${escapeHtml(input.message)}</p>
        ${interventionSection}
        ${vehicleSection}
        ${
          input.interventionId
            ? `<p style="margin: 24px 0 0; color: #999; font-size: 11px;">ID intervention : ${input.interventionId}</p>`
            : ""
        }
      </div>
    `,
  };
}

/**
 * Envoie un email pour toute action sur une intervention (création, statut,
 * modification, annulation). Adresse de destination configurable via
 * EMAIL_NOTIFY_TO (en dev : l'email personnel du développeur). Récupère les
 * infos détaillées de l'intervention et du véhicule pour enrichir le mail.
 * Ne fait jamais échouer l'action appelante : sendMail avale déjà ses
 * propres erreurs, et toute erreur ici (ex: fetch Prisma) est aussi avalée.
 */
async function notifyByEmail(input: InterventionEmailInput): Promise<void> {
  const to = process.env.EMAIL_NOTIFY_TO;
  if (!to) return;

  try {
    const { subject, html } = await buildInterventionEmailContent(input);
    await sendMail({ to, subject, html });
  } catch (error) {
    logError("Failed to build/send intervention email", error, {
      interventionId: input.interventionId,
    });
  }
}

/**
 * Adresse "facturation", configurable via EMAIL_FACTURATION_TO (comme
 * EMAIL_NOTIFY_TO). Si absente, on retombe sur le même comportement
 * qu'avant : boîte de test en dev pour ne pas polluer la vraie boîte
 * facturation pendant les développements.
 */
const FACTURATION_EMAIL =
  process.env.EMAIL_FACTURATION_TO ||
  (process.env.NODE_ENV === "production" ? "facturation@sfeauto.fr" : "actest7970@gmail.com");

/**
 * Notifie la facturation par email (ex: intervention terminée), en réutilisant
 * le même contenu enrichi (intervention + véhicule) que notifyByEmail. Ne fait
 * jamais échouer l'action appelante.
 */
export async function notifyFacturation(input: InterventionEmailInput): Promise<void> {
  try {
    const { subject, html } = await buildInterventionEmailContent(input);
    await sendMail({ to: FACTURATION_EMAIL, subject, html });
  } catch (error) {
    logError("Failed to build/send facturation email", error, {
      interventionId: input.interventionId,
    });
  }
}
