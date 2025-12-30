import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { logError } from '@/lib/logger'
import { validatePassword, validateEmail } from '@/lib/validators'

// GET all users
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      where: {
        isSystemAccount: false  // Hide system/dev accounts from admin dashboard
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
        client: {
          select: { name: true }
        },
        base: {
          select: { location: true }
        }
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(users)
  } catch (error) {
    logError('Failed to fetch users', error)
    return NextResponse.json({ error: 'Échec de la récupération des utilisateurs' }, { status: 500 })
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const body = await request.json()
    const { name, email, password, role, clientId, baseId } = body

    // Validation
    if (!name?.trim() || !email?.trim() || !password?.trim() || !role) {
      return NextResponse.json({ error: 'Nom, email, mot de passe et rôle requis' }, { status: 400 })
    }

    // Email validation
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }

    // Password validation
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
    }

    // Role validation
    const validRoles = ['ADMIN', 'MANAGER', 'MECHANIC', 'CLIENT'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
    }

    // Verify client exists if provided
    if (clientId) {
      const clientExists = await prisma.client.findUnique({ where: { id: clientId } });
      if (!clientExists) {
        return NextResponse.json({ error: 'Client invalide' }, { status: 400 });
      }
    }

    // If CLIENT role, validate that baseId belongs to the selected client
    if (role === 'CLIENT' && clientId && baseId) {
      const base = await prisma.base.findUnique({
        where: { id: baseId },
        select: { clientId: true }
      })

      if (!base || base.clientId !== clientId) {
        return NextResponse.json(
          { error: 'L\'agence sélectionnée n\'appartient pas au client choisi' },
          { status: 400 }
        )
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Cet email existe déjà' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role,
        clientId: clientId || null,
        baseId: baseId || null,
        isSystemAccount: false  // Regular users created via admin are never system accounts
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
        client: {
          select: { name: true }
        },
        base: {
          select: { location: true }
        }
      }
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    logError('Failed to create user', error)
    return NextResponse.json({ error: 'Échec de la création de l\'utilisateur' }, { status: 500 })
  }
}
