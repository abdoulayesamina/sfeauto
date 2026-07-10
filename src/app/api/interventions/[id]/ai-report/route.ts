import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { logError } from "@/src/lib/logger";
import { getAzureOpenAI, AZURE_OPENAI_MODEL } from "@/src/lib/azureOpenAI";

type Ctx = { params: Promise<{ id: string }> };

const REPORT_STYLES = ["technique", "client", "assurance"] as const;

export async function POST(request: NextRequest, context: Ctx) {
  try {
    const session = await auth();

    if (!session?.user || !["MANAGER", "ADMIN", "MECHANIC"].includes(session.user.role)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await context.params;

    const intervention = await prisma.intervention_int.findUnique({
      where: { int_id: id },
      include: {
        int_vehicle: {
          include: {
            veh_brand: true,
            veh_model: true,
            veh_client: true,
          },
        },
        photos: { select: { itp_id: true } },
        devis: { include: { articles: true } },
      },
    });

    if (!intervention) {
      return NextResponse.json({ error: "Intervention non trouvée" }, { status: 404 });
    }

    const vehicle = intervention.int_vehicle;
    const articles = intervention.devis?.articles ?? [];

    const articlesLine = articles.length
      ? articles.map((a: (typeof articles)[number]) => `${a.dea_quantite}x ${a.dea_art_designation}`).join(", ")
      : "aucune pièce facturée sur cette intervention";

    const contextLines = [
      `Véhicule : ${vehicle?.veh_brand?.bra_name ?? "marque inconnue"} ${vehicle?.veh_model?.mod_name ?? ""} (${vehicle?.veh_year ?? "année inconnue"}), immatriculation ${vehicle?.veh_licensePlate ?? "inconnue"}`,
      `Client : ${vehicle?.veh_client?.cli_name ?? "inconnu"}`,
      `Numéro d'accord : ${intervention.int_accordNumber ?? "non renseigné"}`,
      `Notes du mécanicien : ${intervention.int_workDescription?.trim() || "aucune note fournie"}`,
      `Commentaires complémentaires : ${intervention.int_comments?.trim() || "aucun"}`,
      `Pièces remplacées (devis) : ${articlesLine}`,
      `Photos jointes au dossier : ${intervention.photos.length}`,
    ].join("\n");

    if (!intervention.int_workDescription?.trim() && articles.length === 0) {
      return NextResponse.json(
        { error: "Pas assez d'informations sur l'intervention pour générer un compte-rendu (aucune note ni pièce renseignée)." },
        { status: 400 }
      );
    }

    const prompt = `Tu rédiges des comptes-rendus d'intervention pour un garage automobile de gestion de flotte (SFE Auto).
À partir des informations ci-dessous, rédige un compte-rendu en 3 registres différents, 2 à 4 phrases chacun, en français, factuel, sans inventer de détail qui n'est pas fourni :
- "technique" : pour le dossier atelier, précis, vocabulaire mécanique.
- "client" : langage simple et rassurant, destiné au client final propriétaire de la flotte.
- "assurance" : formel, cite le numéro d'accord et les références du devis si disponibles.

Informations sur l'intervention :
${contextLines}

Réponds uniquement avec un JSON strict de la forme :
{"technique": "...", "client": "...", "assurance": "..."}`;

    const completion = await getAzureOpenAI().chat.completions.create({
      model: AZURE_OPENAI_MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;

    if (!raw) {
      throw new Error("Réponse vide du modèle IA");
    }

    const parsed = JSON.parse(raw);

    const report = Object.fromEntries(
      REPORT_STYLES.map((style) => [style, String(parsed?.[style] ?? "").trim()])
    );

    if (REPORT_STYLES.some((style) => !report[style])) {
      throw new Error("Réponse IA incomplète");
    }

    return NextResponse.json({ report });
  } catch (error) {
    logError("Failed to generate AI intervention report", error);
    return NextResponse.json(
      { error: "Échec de la génération du compte-rendu par l'IA" },
      { status: 500 }
    );
  }
}
