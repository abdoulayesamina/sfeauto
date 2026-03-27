import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { logError } from "@/src/lib/logger";
import { validatePassword, validateEmail } from "@/src/lib/validators";

const validRoles = ["ADMIN", "MANAGER", "MECHANIC", "CLIENT", "SIEGE", "AGENCE"] as const;
type ValidRole = (typeof validRoles)[number];

// GET all users
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès administrateur requis" }, { status: 403 });
    }

    const users = await prisma.user_usr.findMany({
      where: { usr_isSystemAccount: false },
      select: {
        usr_id: true,
        usr_name: true,
        usr_email: true,      
        usr_role: true,       
        usr_clientId: true,   
        usr_baseId: true,     
        usr_createdAt: true,  
        usr_updatedAt: true,  

        usr_client: {         
          select: { cli_name: true }   
        },
        usr_base: {           
          select: { bas_location: true } 
        },
      },
      orderBy: [
        { usr_role: "asc" }, 
        { usr_name: "asc" }
      ],
    });

    return NextResponse.json(users);
  } catch (error) {
    logError("Failed to fetch users", error);
    return NextResponse.json({ error: "Échec de la récupération des utilisateurs" }, { status: 500 });
  }
}

// POST create new user (ADMIN creates any user including AGENCE)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Accès administrateur requis" }, { status: 403 });
    }

    const body = await request.json();

    const name = String(body?.usr_name ?? "").trim();
    const email = String(body?.usr_email ?? "").trim().toLowerCase();
    const password = String(body?.usr_password ?? "").trim();
    const role = body?.usr_role as ValidRole | undefined;

    const clientId = body?.usr_clientId ? String(body.usr_clientId) : null;
    const baseId = body?.usr_baseId ? String(body.usr_baseId) : null;

    // Required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Nom, email, mot de passe et rôle requis" },
        { status: 400 }
      );
    }

    // Email validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 });
    }

    // Password validation
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    // Role validation
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    // Verify client exists if provided
    if (clientId) {
      const clientExists = await prisma.client_cli.findUnique({ where: { cli_id: clientId } });
      if (!clientExists) {
        return NextResponse.json({ error: "Client invalide" }, { status: 400 });
      }
    }

    // Rules:
    // - CLIENT: baseId recommandé mais pas obligatoire selon ton choix.
    // - AGENCE: baseId obligatoire (une agence = une base)
    if (role === "AGENCE" && !baseId) {
      return NextResponse.json({ error: "baseId requis pour une agence" }, { status: 400 });
    }

    // Verify base exists if provided (CLIENT/AGENCE/others)
    if (baseId) {
      const base = await prisma.base_bas.findUnique({
        where: { bas_id: baseId },
        select: { bas_id: true, bas_clientId: true },
      });

      if (!base) {
        return NextResponse.json({ error: "Agence (base) invalide" }, { status: 400 });
      }

      // If clientId is provided, ensure base belongs to that client
      if (clientId && base.bas_clientId !== clientId) {
        return NextResponse.json(
          { error: "L'agence sélectionnée n'appartient pas au client choisi" },
          { status: 400 }
        );
      }

      // Special rule: if role CLIENT and both provided, enforce same as before
      if (role === "CLIENT" && clientId && base.bas_clientId !== clientId) {
        return NextResponse.json(
          { error: "L'agence sélectionnée n'appartient pas au client choisi" },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user_usr.findUnique({ where: { usr_email : email } });
    if (existingUser) {
      return NextResponse.json({ error: "Cet email existe déjà" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user_usr.create({
      data: {
        usr_name: name,
        usr_email: email,
        usr_password: hashedPassword,
        usr_role: role,
        usr_clientId: clientId,
        usr_baseId: baseId,
        usr_isSystemAccount: false,
      },
      select: {
        usr_id: true,
        usr_name: true,
        usr_email: true,
        usr_role: true,
        usr_clientId: true,
        usr_baseId: true,
        usr_createdAt: true,
        usr_updatedAt: true,

        usr_client: { 
          select: { cli_name: true } 
        },
        usr_base: { 
          select: { bas_location: true } 
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    logError("Failed to create user", error);
    return NextResponse.json({ error: "Échec de la création de l'utilisateur" }, { status: 500 });
  }
}
