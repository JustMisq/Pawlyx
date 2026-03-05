import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// PUT /api/admin/users/[id] - Modifier un utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authConfig)
    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { isAdmin } = body

    // Empêcher un admin de retirer son propre rôle admin
    if (id === session.user.id && isAdmin === false) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas retirer votre propre rôle admin' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isAdmin },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    })

    // Audit log
    await prisma.activityLog.create({
      data: {
        action: 'update',
        resource: 'User',
        userId: session.user.id,
        resourceId: id,
        newValue: JSON.stringify({ isAdmin }),
      },
    }).catch(() => {})

    return NextResponse.json(user)
  } catch (error) {
    console.error('Erreur PUT /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
