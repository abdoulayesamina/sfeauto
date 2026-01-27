import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { Collection } from "@/src/utils/types/collection";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try{
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
        }

        const { col_name, col_familleId } : Collection = await req.json();
        const id = await params.then(p => Number(p.id));
        const collection = await prisma.te_collection_col.update({
            where: { col_id: id },
            data: { col_name: col_name, col_familleId: col_familleId }
        });

        return NextResponse.json({ collection });

    }catch (error) {
        logError("Failed to update famille", error);
        return NextResponse.json(
            { error: "Échec de la mise à jour de la famille" },
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
        await prisma.te_collection_col.delete({
            where: { col_id: id },
        });

        return NextResponse.json({ message: "Collection supprimée avec succès" });

    }catch (error) {
        logError("Failed to delete famille", error);
        return NextResponse.json(
            { error: "Échec de la suppression de la famille" },
            { status: 500 }
        );
    }
}