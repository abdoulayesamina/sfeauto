import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { Article } from "@/src/utils/types/article";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
        }

        const articles = await prisma.te_article_art.findMany({
            include: {
                collection: true
            }
        });

        return NextResponse.json({ articles });

    }catch (error) {
        logError("Failed to fetch articles", error);
        return NextResponse.json(
            { error: "Échec de la récupération des articles" },
            { status: 500 }
        );
    }
}



export async function POST(req : Request) {
    try{
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
        }

        const body : Article = await req.json();
        const article = await prisma.te_article_art.create({
            data: {
                art_name: body.art_name,
                art_price: body.art_price,
                art_collectionId: body.art_collectionId
            }
        });

        return NextResponse.json({ article });

    }catch (error) {
        logError("Failed to create article", error);
        return NextResponse.json(
            { error: "Échec de la création de l'article" },
            { status: 500 }
        );
    }
}