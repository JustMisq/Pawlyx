import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// GET /api/inventory/categories - Lister toutes les catégories du salon
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json([], { status: 200 })
    }

    const categories = await prisma.inventoryCategory.findMany({
      where: { salonId: salon.id },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { message: 'Error fetching categories' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/categories - Créer une catégorie
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description, color, icon } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: 'Category name is required' },
        { status: 400 }
      )
    }

    // Vérifier que le nom n'existe pas déjà pour ce salon
    const existing = await prisma.inventoryCategory.findFirst({
      where: {
        salonId: salon.id,
        name: name.trim(),
      },
    })

    if (existing) {
      return NextResponse.json(
        { message: 'Category already exists' },
        { status: 409 }
      )
    }

    const category = await prisma.inventoryCategory.create({
      data: {
        name: name.trim(),
        description: description || null,
        color: color || null,
        icon: icon || null,
        salonId: salon.id,
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
          },
        },
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Create category error:', error)
    return NextResponse.json(
      { message: 'Error creating category' },
      { status: 500 }
    )
  }
}

// PUT /api/inventory/categories - Mettre à jour une catégorie
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { id, name, description, color, icon } = body

    if (!id) {
      return NextResponse.json(
        { message: 'Category id is required' },
        { status: 400 }
      )
    }

    // Vérifier que la catégorie existe et appartient au salon
    const category = await prisma.inventoryCategory.findFirst({
      where: { id, salonId: salon.id },
    })

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }

    // Si le nom change, vérifier qu'il n'existe pas déjà
    if (name && name.trim() !== category.name) {
      const existing = await prisma.inventoryCategory.findFirst({
        where: {
          salonId: salon.id,
          name: name.trim(),
          id: { not: id },
        },
      })
      if (existing) {
        return NextResponse.json(
          { message: 'Category with this name already exists' },
          { status: 409 }
        )
      }
    }

    const updated = await prisma.inventoryCategory.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        description: description !== undefined ? description : undefined,
        color: color !== undefined ? color : undefined,
        icon: icon !== undefined ? icon : undefined,
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update category error:', error)
    return NextResponse.json(
      { message: 'Error updating category' },
      { status: 500 }
    )
  }
}

// DELETE /api/inventory/categories?id=xxx - Supprimer une catégorie
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json(
        { message: 'Salon not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { message: 'Category id is required' },
        { status: 400 }
      )
    }

    // Vérifier que la catégorie existe et appartient au salon
    const category = await prisma.inventoryCategory.findFirst({
      where: { id, salonId: salon.id },
    })

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      )
    }

    // Avant de supprimer, détacher les items
    await prisma.inventoryItem.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    })

    // Supprimer la catégorie
    await prisma.inventoryCategory.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Category deleted' })
  } catch (error) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { message: 'Error deleting category' },
      { status: 500 }
    )
  }
}
