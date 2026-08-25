import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import { logError } from "@/src/lib/logger";

// GET : liste des mécaniciens et de leur agence/client actuels — visible par
// ADMIN, MANAGER et MECHANIC (le client veut savoir où se trouve chaque
// mécanicien).
export async function GET() {
  try {
    const session = await auth();

    if (
      !session?.user ||
      !["ADMIN", "MANAGER", "MECHANIC"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const mechanics = await prisma.user_usr.findMany({
      where: { usr_role: "MECHANIC", usr_isSystemAccount: false },
      select: {
        usr_id: true,
        usr_name: true,
        usr_email: true,
        usr_clientId: true,
        usr_baseId: true,
        usr_client: { select: { cli_name: true } },
        usr_base: { select: { bas_location: true } },
      },
      orderBy: { usr_name: "asc" },
    });

    return NextResponse.json(mechanics);
  } catch (error) {
    logError("Failed to fetch mechanics positions", error);
    return NextResponse.json(
      { error: "Échec de la récupération des mécaniciens" },
      { status: 500 },
    );
  }
}

// PATCH : un mécanicien met à jour sa propre position (client + agence).
// Pas d'historique demandé par le client — on écrase simplement usr_clientId
// / usr_baseId, comme pour les autres rôles déjà scopés par ces champs.
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "MECHANIC") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const clientId = body?.clientId ? String(body.clientId) : null;
    const baseId = body?.baseId ? String(body.baseId) : null;

    if (baseId && !clientId) {
      return NextResponse.json(
        { error: "Client requis avec l'agence" },
        { status: 400 },
      );
    }

    if (baseId) {
      const base = await prisma.base_bas.findUnique({
        where: { bas_id: baseId },
        select: { bas_clientId: true },
      });

      if (!base) {
        return NextResponse.json({ error: "Agence invalide" }, { status: 400 });
      }

      if (clientId && base.bas_clientId !== clientId) {
        return NextResponse.json(
          { error: "L'agence sélectionnée n'appartient pas au client choisi" },
          { status: 400 },
        );
      }
    }

    const updated = await prisma.user_usr.update({
      where: { usr_id: session.user.id },
      data: { usr_clientId: clientId, usr_baseId: baseId },
      select: {
        usr_id: true,
        usr_name: true,
        usr_clientId: true,
        usr_baseId: true,
        usr_client: { select: { cli_name: true } },
        usr_base: { select: { bas_location: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logError("Failed to update mechanic position", error);
    return NextResponse.json(
      { error: "Échec de la mise à jour de la position" },
      { status: 500 },
    );
  }
}
