import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try{
        
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
        }

        const id = await params.then(p => Number(p.id));
        if (isNaN(id)) {
        return NextResponse.json(
            { error: `ID de remise invalide` },
            { status: 400 }
        )}

        const body = await req.json();
        const {rem_articleId, rem_pourcentage, rem_prixremise} = body;

        const remiseExist = await prisma.te_remise_rem.findUnique({
            where: { rem_id: id }
        });

        if (!remiseExist) {
        return NextResponse.json(
            { error: "Remise introuvable" },
            { status: 404 }
        );
        }

        const remise = await prisma.te_remise_rem.update({
            where: { rem_id: id },
            data: {rem_articleId, rem_pourcentage, rem_prixremise}
        });

        return NextResponse.json({ remise });

    }catch (error: any) {
        return NextResponse.json(
        { error: "Échec de la mise à jour de la remise" },
        { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try{
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
        }
        const id = await params.then(p => Number(p.id));

        await prisma.te_remise_rem.delete({
            where: { rem_id: id },
        });

        return NextResponse.json({ message: "Remise supprimée avec succès" });

    }catch (error) {
        logError("Failed to delete remise", error);
        return NextResponse.json(
            { error: "Échec de la suppression de la remise" },
            { status: 500 }
        );
    }
}