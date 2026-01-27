import { auth } from "@/auth";
import { logError } from "@/src/lib/logger";
import { prisma } from "@/src/lib/prisma";
import { Remise } from "@/src/utils/types/remise";
import { NextResponse } from "next/server";

export async function GET(){
    try{
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
        }
    
        const remises = await prisma.te_remise_rem.findMany();

        return NextResponse.json({remises});

    }catch(e){
        logError("Failed to fetch remises", e);
        return NextResponse.json(
            { error: "Échec de la récupération des remises" },
            { status: 500 }
        );
    }

}

export async function POST(req : Request){
    try{
        const session = await auth();
        if (!session?.user || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès interdit' }, { status: 403 })
        }

        const body : Remise = await req.json();
        const {rem_articleId, rem_pourcentage, rem_prixremise} = body;

        const newRemise = await prisma.te_remise_rem.create({
            data: {
                rem_articleId: rem_articleId,
                rem_pourcentage: rem_pourcentage,
                rem_prixremise: rem_prixremise  
            }
        })

        return NextResponse.json({remise: newRemise}, {status: 201})

    }catch(e){
        logError("Failed to create remise", e);
        return NextResponse.json(
            { error: "Échec de la création de la remise" },
            { status: 500 }
        );
    }

}