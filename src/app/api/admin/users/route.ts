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

    const users = await prisma.user.findMany({
      where: { isSystemAccount: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clientId: true,
        baseId: true,
        createdAt: true,
        updatedAt: true,
        client: { select: { name: true } },
        base: { select: { location: true } },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
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
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const password = String(body?.password ?? "").trim();
    const role = body?.role as ValidRole | undefined;

    const clientId = body?.clientId ? String(body.clientId) : null;
    const baseId = body?.baseId ? String(body.baseId) : null;

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
      const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
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
      const base = await prisma.base.findUnique({
        where: { id: baseId },
        select: { id: true, clientId: true },
      });

      if (!base) {
        return NextResponse.json({ error: "Agence (base) invalide" }, { status: 400 });
      }

      // If clientId is provided, ensure base belongs to that client
      if (clientId && base.clientId !== clientId) {
        return NextResponse.json(
          { error: "L'agence sélectionnée n'appartient pas au client choisi" },
          { status: 400 }
        );
      }

      // Special rule: if role CLIENT and both provided, enforce same as before
      if (role === "CLIENT" && clientId && base.clientId !== clientId) {
        return NextResponse.json(
          { error: "L'agence sélectionnée n'appartient pas au client choisi" },
          { status: 400 }
        );
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Cet email existe déjà" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        clientId,
        baseId,
        isSystemAccount: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clientId: true,
        baseId: true,
        createdAt: true,
        updatedAt: true,
        client: { select: { name: true } },
        base: { select: { location: true } },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    logError("Failed to create user", error);
    return NextResponse.json({ error: "Échec de la création de l'utilisateur" }, { status: 500 });
  }
}
