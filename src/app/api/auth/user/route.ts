import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { message: 'Error fetching user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email } = body

    // ✅ SÉCURITÉ: Validation des champs
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2 || name.length > 100)) {
      return NextResponse.json({ message: 'Nom invalide (2-100 caractères)' }, { status: 400 })
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ message: 'Email invalide' }, { status: 400 })
      }
      // ✅ SÉCURITÉ: Vérifier que l'email n'est pas déjà pris par un autre utilisateur
      const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json({ message: 'Cet email est déjà utilisé' }, { status: 409 })
      }
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.toLowerCase().trim() }),
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { message: 'Error updating user' },
      { status: 500 }
    )
  }
}
