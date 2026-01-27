import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { Article } from "@/src/utils/types/article";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try{
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
        }

        const body = await req.json();
        const art_name = body?.art_name;
        const art_price = Number(body?.art_price);
        const art_collectionId = Number(body?.art_collectionId);

        const id = await params.then(p => Number(p.id));

        const article = await prisma.te_article_art.update({
            where: { art_id: id },
            data: { art_name: art_name, art_price: art_price, art_collectionId: art_collectionId }
        });

        return NextResponse.json({ article });

    }catch (error) {
        logError("Failed to update article", error);
        return NextResponse.json(
            { error: "Échec de la mise à jour de l'article" },
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
        prisma.te_article_art.delete({
            where: { art_id: id },
        });

        return NextResponse.json({ message: "Article supprimé avec succès" });

    }catch (error) {
        logError("Failed to delete article", error);
        return NextResponse.json(
            { error: "Échec de la suppression de l'article" },
            { status: 500 }
        );
    }
}




