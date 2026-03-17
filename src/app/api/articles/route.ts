import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { Article } from "@/src/utils/types/article";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const session = await auth();
        if (!session || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")) {
            return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
        }
        
        const articles = await prisma.article_art.findMany({
            include: {
                collection: true,
                remises:true
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

        const body = await req.json();
        const art_reference = body?.art_reference;
        const art_name = body?.art_name;
        const art_price = parseFloat(body?.art_price);
        const art_collectionId = Number(body?.art_collectionId);

        const article = await prisma.article_art.create({
            data: {
                art_reference: art_reference,
                art_name: art_name,
                art_price: art_price,
                art_collectionId: art_collectionId
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