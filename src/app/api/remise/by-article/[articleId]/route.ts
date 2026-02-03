import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ articleId: string }> }) {
  try {
    const session = await auth();

    if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const articleId = await params.then((p) => Number(p.articleId));
    if (isNaN(articleId)) {
      return NextResponse.json({ error: "ID d'article invalide" }, { status: 400 });
    }

    // ✅ chercher la remise via rem_articleId (unique)
    const remise = await prisma.te_remise_rem.findUnique({
      where: { rem_articleId: articleId },
    });

    // si pas de remise → renvoyer null (pas une erreur)
    return NextResponse.json({ remise: remise ?? null });
  } catch (error) {
    logError("Failed to fetch remise by articleId", error);
    return NextResponse.json(
      { error: "Échec de la récupération de la remise" },
      { status: 500 }
    );
  }
}
