import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { normalizePlate } from "@/src/lib/normalizePlate";
import { getAzureOpenAI, AZURE_OPENAI_MODEL } from "@/src/lib/azureOpenAI";
import { logError } from "@/src/lib/logger";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_PREFIX = "image/";
const MAX_PHOTOS = 6;

const ANALYZE_PROMPT = `Tu analyses des photos prises par un mécanicien de garage pour préparer une intervention.

Réponds uniquement avec un JSON strict de la forme :
{
  "plate": string | null,
  "plateConfidence": "high" | "low" | "none",
  "damageDescription": string,
  "interventionSummary": string
}

Règles strictes :
- "plate" : uniquement si une plaque française est lisible sans ambiguïté sur au moins une photo. Si elle est partielle, floue, ou si plusieurs plaques différentes apparaissent sans que l'une soit clairement le véhicule principal, retourne null avec "plateConfidence": "low" ou "none".
- Ne jamais inventer une plaque, une marque ou un dommage non visible sur les photos.
- Si aucun véhicule n'est identifiable sur les photos, dis-le explicitement dans "damageDescription" plutôt que d'inventer.
- "interventionSummary" : une phrase courte utilisable comme description initiale d'intervention.`;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = session?.user?.role;

    if (!session || !["MANAGER", "AGENCE", "ADMIN", "MECHANIC"].includes(role as string)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Utilisez multipart/form-data" }, { status: 400 });
    }

    const form = await request.formData();
    const files = (form.getAll("photos") as File[]) ?? [];

    if (!files.length) {
      return NextResponse.json({ error: "Aucune photo reçue" }, { status: 400 });
    }

    if (files.length > MAX_PHOTOS) {
      return NextResponse.json({ error: `Maximum ${MAX_PHOTOS} photos par analyse` }, { status: 400 });
    }

    const imageParts: { type: "image_url"; image_url: { url: string } }[] = [];

    for (const file of files) {
      if (!(file instanceof File)) continue;

      if (!file.type?.startsWith(ALLOWED_PREFIX)) {
        return NextResponse.json({ error: "Type non supporté" }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Fichier trop lourd (50MB max)" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");

      imageParts.push({
        type: "image_url",
        image_url: { url: `data:${file.type};base64,${base64}` },
      });
    }

    if (!imageParts.length) {
      return NextResponse.json({ error: "Aucune photo exploitable" }, { status: 400 });
    }

    const completion = await getAzureOpenAI().chat.completions.create({
      model: AZURE_OPENAI_MODEL,
      messages: [
        {
          role: "user",
          content: [{ type: "text", text: ANALYZE_PROMPT }, ...imageParts],
        },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("Réponse vide du modèle IA");
    }

    const parsed = JSON.parse(raw);

    const plateConfidence: "high" | "low" | "none" =
      parsed?.plateConfidence === "high" || parsed?.plateConfidence === "low"
        ? parsed.plateConfidence
        : "none";

    // Défense en profondeur : on ne fait confiance à une plaque que si le
    // modèle a lui-même déclaré une confiance haute.
    const plate: string | null = plateConfidence === "high" && parsed?.plate ? String(parsed.plate) : null;

    const aiSummary = {
      damageDescription: String(parsed?.damageDescription ?? "").trim(),
      interventionSummary: String(parsed?.interventionSummary ?? "").trim(),
    };

    let matchedVehicle = null;

    if (plate) {
      const normalized = normalizePlate(plate);

      matchedVehicle = await prisma.vehicle_veh.findFirst({
        where: {
          veh_normalizedPlate: normalized,
          ...(role === "AGENCE" ? { veh_baseId: session.user.baseId ?? undefined } : {}),
        },
        include: {
          veh_brand: true,
          veh_model: true,
          veh_client: true,
          veh_base: true,
        },
      });
    }

    return NextResponse.json({
      plate,
      plateConfidence,
      matchedVehicle,
      aiSummary,
    });
  } catch (error) {
    logError("Failed to analyze intervention photos", error);
    return NextResponse.json(
      { error: "Échec de l'analyse des photos par l'IA" },
      { status: 500 }
    );
  }
}
