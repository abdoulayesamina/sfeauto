import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'
import { logError } from '@/src/lib/logger'
import { validatePassword, validateEmail } from '@/src/lib/validators'

// PUT update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { 
      usr_name: name, 
      usr_email: email, 
      usr_password: oldPassword,
      newPassword,
      usr_role: role, 
      usr_clientId: clientId, 
      usr_baseId: baseId 
    } = body

    // Validation
    if (!name?.trim() || !email?.trim() || !role) {
      return NextResponse.json({ error: 'Nom, email et rôle requis' }, { status: 400 })
    }

    // Email validation
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json({ error: emailValidation.error }, { status: 400 })
    }
    
    // Role validation
    const validRoles = ['ADMIN', 'MANAGER', 'MECHANIC', 'CLIENT','SIEGE', 'AGENCE'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 });
    }

    // Check if email already exists (excluding current user)
    const existingUser = await prisma.user_usr.findFirst({
      where: {
        usr_email: email.trim().toLowerCase(),
        usr_id: { not: id }
      }
    })
    
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email existe déjà' }, { status: 400 })
    }

    // ====================== GESTION DU MOT DE PASSE ======================
    let hashedNewPassword: string | undefined = undefined

    if (newPassword?.trim()) {
      // Cas où l'utilisateur veut changer le mot de passe

      if (!oldPassword?.trim()) {
        return NextResponse.json(
          { error: "L'ancien mot de passe est requis pour changer le mot de passe" }, 
          { status: 400 }
        )
      }

      // Récupérer l'utilisateur actuel pour vérifier l'ancien mot de passe
      const currentUser = await prisma.user_usr.findUnique({
        where: { usr_id : id },
        select: { usr_password: true }
      })

      if (!currentUser) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
      }

      // Vérifier que l'ancien mot de passe est correct
      const isOldPasswordCorrect = await bcrypt.compare(oldPassword, currentUser.usr_password)
      if (!isOldPasswordCorrect) {
        return NextResponse.json(
          { error: "L'ancien mot de passe est incorrect" }, 
          { status: 400 }
        )
      }

      // Valider le nouveau mot de passe
      const passwordValidation = validatePassword(newPassword)
      if (!passwordValidation.valid) {
        return NextResponse.json({ error: passwordValidation.error }, { status: 400 })
      }

      // Hasher le nouveau mot de passe
      hashedNewPassword = await bcrypt.hash(newPassword, 10)
    }

    // If CLIENT role, validate that baseId belongs to the selected client
    if (role === 'CLIENT' && clientId && baseId) {
      const base = await prisma.base_bas.findUnique({
        where: { bas_id: baseId },
        select: { bas_clientId: true }
      })

      if (!base || base.bas_clientId !== clientId) {
        return NextResponse.json(
          { error: 'L\'agence sélectionnée n\'appartient pas au client choisi' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {
      usr_name: name.trim(),
      usr_email: email.trim().toLowerCase(),
      usr_role: role,
      usr_clientId: clientId || null,
      usr_baseId: baseId || null
    }

    // On ajoute le nouveau mot de passe hashé uniquement s'il y en a un
    if (hashedNewPassword) {
      updateData.usr_password = hashedNewPassword
    }

    // Update user
    const user = await prisma.user_usr.update({
    where: { usr_id: id },
      data: updateData,
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
        }
      }
    });

    return NextResponse.json(user)
  } catch (error) {
    logError('Failed to update user', error)
    return NextResponse.json({ error: 'Échec de la mise à jour de l\'utilisateur' }, { status: 500 })
  }
}

// DELETE user
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const session = await auth()

//     if (!session?.user || session.user.role !== 'ADMIN') {
//       return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
//     }

//     const { id } = await params

//     // Prevent admin from deleting themselves
//     if (id === session.user.id) {
//       return NextResponse.json({ error: 'Impossible de supprimer votre propre compte' }, { status: 400 })
//     }

//     // Check if user is a system account
//     const user = await prisma.user.findUnique({
//       where: { id },
//       select: { isSystemAccount: true }
//     })

//     if (!user) {
//       return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
//     }

//     if (user.isSystemAccount) {
//       return NextResponse.json({ error: 'Impossible de supprimer un compte système' }, { status: 403 })
//     }

//     await prisma.user.delete({
//       where: { id }
//     })

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     logError('Failed to delete user', error)
//     return NextResponse.json({ error: 'Échec de la suppression de l\'utilisateur' }, { status: 500 })
//   }
// }

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès administrateur requis' }, { status: 403 })
    }

    const { id } = await params

    // Prevent self delete
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Impossible de supprimer votre propre compte' },
        { status: 400 }
      )
    }

    const user = await prisma.user_usr.findUnique({
      where: { usr_id: id },
      select: { usr_isSystemAccount: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    if (user.usr_isSystemAccount) {
      return NextResponse.json(
        { error: 'Impossible de supprimer un compte système' },
        { status: 403 }
      )
    }

    //  DELETE avec gestion d'erreur métier
    await prisma.user_usr.delete({
      where: { usr_id: id }
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {

    // 🔥 CAS IMPORTANT : relation existante
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer cet utilisateur car il est lié à d'autres données"
        },
        { status: 409 }
      )
    }

    logError('Failed to delete user', error)

    return NextResponse.json(
      { error: 'Échec de la suppression de l\'utilisateur' },
      { status: 500 }
    )
  }
}
