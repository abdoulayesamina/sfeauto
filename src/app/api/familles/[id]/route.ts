import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 },
      );
    }

    const id = await params.then((p) => Number(p.id));
    if (isNaN(id)) {
      return NextResponse.json(
        { error: `ID de famille invalide` },
        { status: 400 },
      );
    }

    const body = await req.json();
    const fam_name = body?.fam_name;

    if (!fam_name || typeof fam_name !== "string") {
      return NextResponse.json(
        { error: "Nom de famille invalide" },
        { status: 400 },
      );
    }

    const familleExist = await prisma.famille_fam.findUnique({
      where: { fam_id: id },
    });

    if (!familleExist) {
      return NextResponse.json(
        { error: "Famille introuvable" },
        { status: 404 },
      );
    }

    const famille = await prisma.famille_fam.update({
      where: { fam_id: id },
      data: { fam_name },
    });

    return NextResponse.json({ famille });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Échec de la mise à jour de la famille" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès administrateur requis" },
        { status: 403 },
      );
    }
    const id = await params.then((p) => Number(p.id));

    await prisma.famille_fam.delete({
      where: { fam_id: id },
    });

    return NextResponse.json({ message: "Famille supprimée avec succès" });
  } catch (error) {
    logError("Failed to delete famille", error);
    return NextResponse.json(
      { error: "Échec de la suppression de la famille" },
      { status: 500 },
    );
  }
}
