import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import Stripe from 'stripe'
import { authConfig } from '@/lib/auth-config'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

/**
 * POST /api/subscription/cancel
 * Annule l'abonnement à la fin de la période en cours.
 * L'utilisateur garde l'accès jusqu'à currentPeriodEnd.
 */
export async function POST() {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // 1. Chercher la subscription en BDD
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Aucun abonnement actif' },
        { status: 404 }
      )
    }

    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Abonnement sans ID Stripe' },
        { status: 400 }
      )
    }

    // 2. Annuler sur Stripe (à la fin de la période)
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    )

    console.log(`✅ [CANCEL] Subscription ${subscription.id} → cancel_at_period_end`)
    console.log(`   Fin de période: ${new Date(stripeSubscription.current_period_end * 1000).toISOString()}`)

    // 3. Mettre à jour en BDD (status reste "active" jusqu'à la fin)
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancel_at_period_end',
      },
    })

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: subscription.currentPeriodEnd,
    })
  } catch (error) {
    console.error('❌ [CANCEL] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/subscription/cancel
 * Réactive l'abonnement (annule la résiliation programmée).
 */
export async function DELETE() {
  try {
    const session = await getServerSession(authConfig)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Aucun abonnement trouvé' },
        { status: 404 }
      )
    }

    if (subscription.status !== 'cancel_at_period_end') {
      return NextResponse.json(
        { error: 'L\'abonnement n\'est pas en cours de résiliation' },
        { status: 400 }
      )
    }

    // Réactiver sur Stripe
    await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    )

    console.log(`✅ [REACTIVATE] Subscription ${subscription.id} réactivée`)

    // Mettre à jour en BDD
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'active' },
    })

    return NextResponse.json({ success: true, reactivated: true })
  } catch (error) {
    console.error('❌ [REACTIVATE] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la réactivation' },
      { status: 500 }
    )
  }
}
