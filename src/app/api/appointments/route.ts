import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'
import { checkRouteRateLimit } from '@/lib/rate-limit'
import { appointmentSchema, validateRequest } from '@/lib/validations'

// Constantes pour la gestion des annulations
const LATE_CANCELLATION_HOURS = 24

// GET /api/appointments?from=2026-02-01&to=2026-02-28
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const status = searchParams.get('status')

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json([], { status: 200 })
    }

    const where: any = { 
      salonId: salon.id,
      deletedAt: null,
    }

    if (from && to) {
      where.startTime = {
        gte: new Date(from),
        lte: new Date(to),
      }
    }

    if (status) {
      where.status = status
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
        animal: true,
        services: {
          include: {
            service: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Get appointments error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorName = error instanceof Error ? error.name : 'Error'
    return NextResponse.json(
      { message: 'Error fetching appointments', error: errorName, details: errorMessage },
      { status: 500 }
    )
  }
}

// POST /api/appointments
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - check API rate limit
    const rateLimitResponse = await checkRouteRateLimit(request, 'api')
    if (rateLimitResponse) return rateLimitResponse

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
    const { clientId, animalId, serviceIds, startTime, notes, internalNotes } = body

    // Accepter ancien format avec serviceId pour compatibilité rétro
    const ids = serviceIds || (body.serviceId ? [body.serviceId] : [])

    if (!clientId || !animalId || ids.length === 0 || !startTime) {
      return NextResponse.json(
        { message: 'clientId, animalId, serviceIds (array), and startTime are required' },
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

    // Vérifier que l'animal appartient au client
    const animal = await prisma.animal.findFirst({
      where: { id: animalId, clientId, deletedAt: null },
    })

    if (!animal) {
      return NextResponse.json({ message: 'Animal not found' }, { status: 404 })
    }

    // Vérifier que tous les services appartiennent au salon
    const services = await prisma.service.findMany({
      where: { id: { in: ids }, salonId: salon.id },
    })

    if (services.length !== ids.length) {
      return NextResponse.json({ message: 'One or more services not found' }, { status: 404 })
    }

    // Calculer l'heure de fin basée sur la durée totale
    const start = new Date(startTime)
    const totalDuration = services.reduce((sum, s) => sum + s.duration, 0)
    const end = new Date(start.getTime() + totalDuration * 60000)
    const totalPrice = services.reduce((sum, s) => sum + s.price, 0)

    // ✅ FIX: Utiliser une transaction pour créer RDV + facture + rappel atomiquement
    // Évite les race conditions sur le numéro de facture
    const appointment = await prisma.$transaction(async (tx) => {
      // Créer le rendez-vous (sans serviceId pour nouveau format)
      const newAppointment = await tx.appointment.create({
        data: {
          clientId,
          animalId,
          serviceId: ids[0], // Garde pour compatibilité rétro (premier service)
          salonId: salon.id,
          date: start,
          startTime: start,
          endTime: end,
          totalPrice: totalPrice,
          notes: notes || null,
          internalNotes: internalNotes || null,
          status: 'scheduled',
        },
        include: {
          client: true,
          animal: true,
          services: {
            include: {
              service: true,
            },
          },
        },
      })

      // Créer les liens AppointmentService pour chaque service sélectionné
      for (const serviceId of ids) {
        await tx.appointmentService.create({
          data: {
            appointmentId: newAppointment.id,
            serviceId: serviceId,
          },
        })
      }

      // Créer automatiquement une facture (dans la transaction)
      const year = new Date().getFullYear()
      const latestInvoice = await tx.invoice.findFirst({
        where: {
          invoiceNumber: { startsWith: `APT-${year}-` },
        },
        orderBy: { invoiceNumber: 'desc' },
      })

      let nextNumber = 1
      if (latestInvoice) {
        const lastNum = parseInt(latestInvoice.invoiceNumber.split('-')[2])
        nextNumber = lastNum + 1
      }
      const invoiceNumber = `APT-${year}-${String(nextNumber).padStart(3, '0')}`

      const taxRate = 20
      const subtotal = totalPrice
      const taxAmount = (subtotal * taxRate) / 100
      const total = subtotal + taxAmount

      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30)

      // Créer les items de facture pour chaque service
      const invoiceItems = services.map((service) => ({
        service: service.name,
        description: service.description || 'Prestation de toilettage',
        quantity: 1,
        pricePerUnit: service.price,
      }))

      await tx.invoice.create({
        data: {
          invoiceNumber,
          type: 'appointment',
          items: JSON.stringify(invoiceItems),
          clientId,
          appointmentId: newAppointment.id,
          subtotal,
          taxRate,
          taxAmount,
          total,
          salonId: salon.id,
          status: 'draft',
          dueDate,
        },
      })

      // Créer un rappel pour 24h avant
      const reminderDate = new Date(start)
      reminderDate.setHours(reminderDate.getHours() - 24)
      
      if (reminderDate > new Date()) {
        // Créer rappel EMAIL (toujours)
        await tx.reminder.create({
          data: {
            type: 'appointment_24h',
            channel: 'email',
            scheduledFor: reminderDate,
            appointmentId: newAppointment.id,
            status: 'pending',
          },
        })

        // Créer rappel SMS si le client a un numéro de téléphone
        if (client.phone) {
          await tx.reminder.create({
            data: {
              type: 'appointment_24h',
              channel: 'sms',
              scheduledFor: reminderDate,
              appointmentId: newAppointment.id,
              status: 'pending',
            },
          })
        }
      }

      return newAppointment
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('💥 POST appointments error:', error)
    return NextResponse.json(
      { message: 'Error creating appointment' },
      { status: 500 }
    )
  }
}

// PUT /api/appointments?id=xxx - Mettre à jour un rendez-vous
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: 'ID required' }, { status: 400 })
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ message: 'Salon not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status, notes, internalNotes, cancellationReason, finalPrice, finalDuration, observations } = body

    // Vérifier que le RDV appartient au salon
    const existingAppointment = await prisma.appointment.findFirst({
      where: { id, salonId: salon.id, deletedAt: null },
    })

    if (!existingAppointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 })
    }

    const updateData: any = {}

    // Gestion des notes
    if (notes !== undefined) updateData.notes = notes
    if (internalNotes !== undefined) updateData.internalNotes = internalNotes
    if (observations !== undefined) updateData.observations = observations

    // Pour services flexibles - mise à jour du prix et durée finaux
    if (finalPrice !== undefined) updateData.finalPrice = finalPrice
    if (finalDuration !== undefined) updateData.finalDuration = finalDuration

    // Gestion du changement de statut
    if (status) {
      updateData.status = status

      // Annulation
      if (status === 'cancelled') {
        updateData.cancelledAt = new Date()
        updateData.cancellationReason = cancellationReason || null

        // Vérifier si c'est une annulation tardive (< 24h)
        const hoursUntilAppointment = 
          (existingAppointment.startTime.getTime() - Date.now()) / (1000 * 60 * 60)
        
        if (hoursUntilAppointment < LATE_CANCELLATION_HOURS) {
          updateData.isLateCancel = true
        }

        // Annuler les rappels associés
        await prisma.reminder.updateMany({
          where: { appointmentId: id, status: 'pending' },
          data: { status: 'cancelled' },
        })
      }

      // No-show
      if (status === 'no_show') {
        console.log('📛 No-show enregistré pour client:', existingAppointment.clientId)
      }

      // Terminé -> Marquer la facture comme envoyée et mettre à jour le prix si flexible
      if (status === 'completed') {
        // Si c'est un service flexible, mettre à jour la facture avec le prix final
        if (finalPrice !== undefined) {
          const taxRate = 20
          const subtotal = finalPrice
          const taxAmount = (subtotal * taxRate) / 100
          const total = subtotal + taxAmount

          await prisma.invoice.updateMany({
            where: { appointmentId: id, status: 'draft' },
            data: { 
              status: 'sent',
              subtotal,
              taxAmount,
              total,
            },
          })
        } else {
          await prisma.invoice.updateMany({
            where: { appointmentId: id, status: 'draft' },
            data: { status: 'sent' },
          })
        }
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        animal: true,
        services: {
          include: {
            service: true,
          },
        },
      },
    })

    return NextResponse.json(appointment)
  } catch (error) {
    console.error('PUT appointment error:', error)
    return NextResponse.json(
      { message: 'Error updating appointment' },
      { status: 500 }
    )
  }
}

// DELETE /api/appointments?id=xxx (Soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get('id')

    if (!appointmentId) {
      return NextResponse.json(
        { message: 'Appointment ID is required' },
        { status: 400 }
      )
    }

    const salon = await prisma.salon.findUnique({
      where: { userId: session.user.id },
    })

    if (!salon) {
      return NextResponse.json({ message: 'Salon not found' }, { status: 404 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, salonId: salon.id },
    })

    if (!appointment) {
      return NextResponse.json({ message: 'Appointment not found' }, { status: 404 })
    }

    // Soft delete
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { deletedAt: new Date() },
    })

    // Annuler les rappels
    await prisma.reminder.updateMany({
      where: { appointmentId, status: 'pending' },
      data: { status: 'cancelled' },
    })

    console.log('✅ Appointment soft deleted:', appointmentId)
    return NextResponse.json({ message: 'Appointment deleted successfully' })
  } catch (error) {
    console.error('💥 DELETE appointment error:', error)
    return NextResponse.json(
      { message: 'Error deleting appointment' },
      { status: 500 }
    )
  }
}