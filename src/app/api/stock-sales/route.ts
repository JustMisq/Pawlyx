import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

// POST /api/stock-sales - Créer une facture pour une vente de stock
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
      return NextResponse.json({ message: 'Salon not found' }, { status: 404 })
    }

    const body = await request.json()
    const { clientId, inventoryItemId, quantity, notes } = body

    // Validation
    if (!clientId || !inventoryItemId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { message: 'clientId, inventoryItemId, and quantity are required' },
        { status: 400 }
      )
    }

    // Vérifier que le client appartient au salon
    const client = await prisma.client.findFirst({
      where: { id: clientId, salonId: salon.id, deletedAt: null },
    })

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 })
    }

    // Vérifier que l'item d'inventaire existe et qu'il y a assez de stock
    const inventoryItem = await prisma.inventoryItem.findFirst({
      where: { id: inventoryItemId, salonId: salon.id },
    })

    if (!inventoryItem) {
      return NextResponse.json({ message: 'Inventory item not found' }, { status: 404 })
    }

    if (inventoryItem.quantity < quantity) {
      return NextResponse.json(
        { message: `Insufficient stock. Available: ${inventoryItem.quantity} ${inventoryItem.unit}` },
        { status: 400 }
      )
    }

    // Créer la facture et la vente de stock dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Calculer les totaux
      const total = inventoryItem.price * quantity
      const taxRate = 20
      const subtotal = total
      const taxAmount = (subtotal * taxRate) / 100
      const totalTTC = subtotal + taxAmount

      // Générer le numéro de facture
      const year = new Date().getFullYear()
      const latestInvoice = await tx.invoice.findFirst({
        where: {
          salonId: salon.id,
          invoiceNumber: { startsWith: `INV-${year}-` },
        },
        orderBy: { invoiceNumber: 'desc' },
      })

      let nextNumber = 1
      if (latestInvoice) {
        const lastNum = parseInt(latestInvoice.invoiceNumber.split('-')[2])
        nextNumber = lastNum + 1
      }
      const invoiceNumber = `INV-${year}-${String(nextNumber).padStart(3, '0')}`

      // Créer la facture
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          type: 'stock_sale',
          items: JSON.stringify([
            {
              product: inventoryItem.name,
              description: inventoryItem.description || '',
              quantity,
              unit: inventoryItem.unit,
              pricePerUnit: inventoryItem.price,
            },
          ]),
          clientId,
          salonId: salon.id,
          subtotal,
          taxRate,
          taxAmount,
          total: totalTTC,
          status: 'draft',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        },
      })

      // Créer la vente de stock
      const stockSale = await tx.stockSale.create({
        data: {
          quantity,
          pricePerUnit: inventoryItem.price,
          total: subtotal,
          notes: notes || null,
          salonId: salon.id,
          clientId,
          inventoryItemId,
          invoiceId: invoice.id,
        },
        include: {
          inventoryItem: true,
          client: true,
        },
      })

      // Réduire la quantité d'inventaire
      await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: { quantity: inventoryItem.quantity - quantity },
      })

      // Créer un audit log
      await tx.auditLog.create({
        data: {
          action: 'stock_sale',
          entityType: 'inventory',
          entityId: inventoryItemId,
          newValue: JSON.stringify({ quantity, unit: inventoryItem.unit, total: subtotal }),
          userId: session.user.id,
          salonId: salon.id,
        },
      })

      return { stockSale, invoice }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('💥 POST stock-sales error:', error)
    return NextResponse.json(
      { message: 'Error creating stock sale' },
      { status: 500 }
    )
  }
}

// GET /api/stock-sales - Lister les ventes de stock
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

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    const where: any = { salonId: salon.id }
    if (clientId) {
      where.clientId = clientId
    }

    const stockSales = await prisma.stockSale.findMany({
      where,
      include: {
        inventoryItem: true,
        client: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(stockSales)
  } catch (error) {
    console.error('GET stock-sales error:', error)
    return NextResponse.json(
      { message: 'Error fetching stock sales' },
      { status: 500 }
    )
  }
}
