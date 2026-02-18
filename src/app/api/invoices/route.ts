import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

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
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    const where: any = { salonId: salon.id }
    if (status) where.status = status
    if (clientId) where.clientId = clientId

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        appointment: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Get invoices error:', error)
    return NextResponse.json(
      { message: 'Error fetching invoices' },
      { status: 500 }
    )
  }
}

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
    const { clientId, appointmentId, subtotal, taxRate, type, items } = body

    if (!clientId || subtotal === undefined) {
      return NextResponse.json(
        { message: 'clientId and subtotal are required' },
        { status: 400 }
      )
    }

    // ✅ FIX: Utiliser une transaction pour éviter les race conditions sur le numéro
    const invoice = await prisma.$transaction(async (tx) => {
      const year = new Date().getFullYear()
      // Déterminer le type et le préfixe
      const invoiceType = type || 'appointment'
      const prefix = invoiceType === 'stock_sale' ? 'STK' : 'APT'
      
      const latestInvoice = await tx.invoice.findFirst({
        where: {
          salonId: salon.id,
          invoiceNumber: {
            startsWith: `${prefix}-${year}-`,
          },
        },
        orderBy: { invoiceNumber: 'desc' },
      })

      let nextNumber = 1
      if (latestInvoice) {
        const lastNum = parseInt(latestInvoice.invoiceNumber.split('-')[2])
        nextNumber = lastNum + 1
      }
      const invoiceNumber = `${prefix}-${year}-${String(nextNumber).padStart(3, '0')}`

      const finalTaxRate = taxRate || 20
      const taxAmount = (subtotal * finalTaxRate) / 100
      const total = subtotal + taxAmount

      // Déterminer les items
      let invoiceItems = items // Peut être fourni par le client
      
      // Si pas d'items fournis et c'est un appointment, charger les détails du service
      if (!invoiceItems && appointmentId && invoiceType === 'appointment') {
        const appointment = await tx.appointment.findFirst({
          where: {
            id: appointmentId,
            salonId: salon.id,
          },
          include: {
            service: true,
          },
        })
        
        if (appointment?.service) {
          invoiceItems = JSON.stringify([
            {
              service: appointment.service.name,
              description: appointment.service.description || 'Prestation de toilettage',
              quantity: 1,
              pricePerUnit: subtotal,
            },
          ])
        }
      }

      return tx.invoice.create({
        data: {
          invoiceNumber,
          type: invoiceType,
          items: invoiceItems || null,
          clientId,
          appointmentId: appointmentId || null,
          subtotal,
          taxRate: finalTaxRate,
          taxAmount,
          total,
          salonId: salon.id,
        },
        include: {
          client: true,
          appointment: true,
        },
      })
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('Create invoice error:', error)
    return NextResponse.json(
      { message: 'Error creating invoice' },
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
    const { id, status } = body

    if (!id) {
      return NextResponse.json(
        { message: 'id is required' },
        { status: 400 }
      )
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!invoice || invoice.salonId !== salon.id) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        // ✅ FIX: Ne pas effacer paidAt lors d'un changement de statut
        // Seulement mettre paidAt quand on passe à 'paid'
        ...(status === 'paid' && !invoice.paidAt ? { paidAt: new Date() } : {}),
      },
      include: {
        client: true,
        appointment: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update invoice error:', error)
    return NextResponse.json(
      { message: 'Error updating invoice' },
      { status: 500 }
    )
  }
}

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
        { message: 'id is required' },
        { status: 400 }
      )
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!invoice || invoice.salonId !== salon.id) {
      return NextResponse.json(
        { message: 'Invoice not found' },
        { status: 404 }
      )
    }

    await prisma.invoice.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Invoice deleted' })
  } catch (error) {
    console.error('Delete invoice error:', error)
    return NextResponse.json(
      { message: 'Error deleting invoice' },
      { status: 500 }
    )
  }
}
