import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { Collection } from "@/src/utils/types/collection";
import { NextResponse } from "next/server";

export async function GET() {
    try{

        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
        }

        const collections = await prisma.collection_col.findMany({
            include: {
                articles: true
            }
        });

        return NextResponse.json({ collections });

    }catch (error) {
        logError("Failed to fetch collections", error);
        return NextResponse.json(
            { error: "Échec de la récupération des collections" },
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

        const body : Collection = await req.json();
        const { col_name, col_familleId } = body;
        const collection = await prisma.collection_col.create({
            data: {
                col_name: col_name,
                col_familleId: col_familleId
            }
        });

        return NextResponse.json({ collection });

    }catch (error) {
        logError("Failed to create collection", error);
        return NextResponse.json(
            { error: "Échec de la création de la collection" },
            { status: 500 }
        );
    }
}