import nodemailer from "nodemailer";
import { logError } from "@/src/lib/logger";

let transporter: nodemailer.Transporter | null = null;
let transporterInitialized = false;

function getTransporter(): nodemailer.Transporter | null {
  if (transporterInitialized) return transporter;
  transporterInitialized = true;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    return null;
  }

  const port = Number(EMAIL_PORT) || 587;

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: port === 465,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });

  return transporter;
}

type SendMailOptions = {
  to: string;
  subject: string;
  html: string;
};

/**
 * Envoie un email. N'échoue jamais : toute erreur (config manquante, SMTP
 * indisponible, etc.) est loggée et avalée pour ne jamais bloquer l'action
 * appelante (création/modification d'intervention, etc.).
 */
export async function sendMail({ to, subject, html }: SendMailOptions): Promise<void> {
  try {
    const transport = getTransporter();

    if (!transport) {
      logError(
        "Email non envoyé : configuration SMTP manquante (EMAIL_HOST/EMAIL_USER/EMAIL_PASS)",
        new Error("SMTP_NOT_CONFIGURED"),
      );
      return;
    }

    await transport.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (error) {
    logError("Échec de l'envoi de l'email", error, { to, subject });
  }
}
