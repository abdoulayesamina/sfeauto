// /app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email et mot de passe requis' },
      { status: 400 }
    )
  }

  const user = await prisma.user_usr.findUnique({
    where: { usr_email: email.toLowerCase() }
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Utilisateur introuvable' },
      { status: 401 }
    )
  }

  const isValid = await bcrypt.compare(password, user.usr_password)
  if (!isValid) {
    return NextResponse.json(
      { error: 'Mot de passe incorrect' },
      { status: 401 }
    )
  }

  return NextResponse.json({
    id: user.usr_id,
    name: user.usr_name,
    email: user.usr_email,
    role: user.usr_role,
    clientId: user.usr_clientId,
    baseId: user.usr_baseId
  })
}