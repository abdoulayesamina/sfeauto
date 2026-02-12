import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { Famille } from "@/src/utils/types/famille";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 },
      );
    }

    //recupération des familles
    const familles = await prisma.famille_fam.findMany({
      include: {
        collections: {
          include: {
            articles: true,
          },
        },
      },
    });

    return NextResponse.json({ familles });
  } catch (error) {
    logError("Failed to fetch familles", error);
    return NextResponse.json(
      { error: "Échec de la récupération des familles" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 },
      );
    }

    const body: Famille = await req.json();
    const { fam_name } = body;

    if (!fam_name || !fam_name.trim()) {
      return NextResponse.json(
        { error: "Le nom de la famille est requis" },
        { status: 400 },
      );
    }

    const newFamille = await prisma.famille_fam.create({
      data: {
        fam_name: fam_name.trim(),
      },
    });

    return NextResponse.json({ famille: newFamille }, { status: 201 });
  } catch (error) {
    logError("Failed to create famille", error);
    return NextResponse.json(
      { error: "Échec de la création de la famille" },
      { status: 500 },
    );
  }
}
