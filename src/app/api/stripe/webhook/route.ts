import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { resolvePlanFromPriceId } from '@/lib/plans'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

/**
 * Webhook Stripe - Gère les événements de paiement
 * Endpoint: POST /api/stripe/webhook
 * 
 * Événements gérés:
 * - checkout.session.completed: Crée/met à jour la subscription
 * - customer.subscription.deleted: Annule la subscription
 * - invoice.payment_succeeded: Met à jour les dates de facture
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const body = await request.text()
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  // ===================================================================
  // 1. VALIDER LA SIGNATURE (sécurité critique)
  // ===================================================================
  
  if (!secret) {
    console.error('❌ [WEBHOOK] STRIPE_WEBHOOK_SECRET non configuré')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  if (!signature) {
    console.error('❌ [WEBHOOK] Header stripe-signature manquant')
    return NextResponse.json(
      { error: 'Missing signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
    console.log(`✅ [WEBHOOK] Signature validée - Type: ${event.type}`)
  } catch (err) {
    console.error('❌ [WEBHOOK] Signature invalide:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // ===================================================================
  // 2. TRAITER LES ÉVÉNEMENTS
  // ===================================================================

  try {
    switch (event.type) {
      // USER COMPLÈTE UN PAIEMENT ET CRÉE UNE SUBSCRIPTION
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log(`📦 [WEBHOOK] checkout.session.completed reçu`)
        console.log(`   Email: ${session.customer_email}`)
        console.log(`   Subscription ID: ${session.subscription}`)

        // Validation
        if (!session.customer_email || !session.subscription) {
          console.warn(
            '⚠️ [WEBHOOK] Session incomplète:',
            { email: session.customer_email, sub: session.subscription }
          )
          // On retourne 200 même si c'est incomplet (Stripe ne peut pas refaire)
          return NextResponse.json({ received: true })
        }

        // 2.1: Chercher l'utilisateur
        let user
        try {
          user = await prisma.user.findUnique({
            where: { email: session.customer_email },
            select: { id: true, email: true }
          })
        } catch (err) {
          console.error('❌ [WEBHOOK] Erreur DB - findUnique:', err)
          throw err
        }

        if (!user) {
          console.warn(`⚠️ [WEBHOOK] User non trouvé: ${session.customer_email}`)
          // On accepte quand même (user créera compte plus tard)
          return NextResponse.json({ received: true })
        }

        // 2.2: Récupérer les infos de la subscription Stripe
        let stripeSubscription: Stripe.Subscription
        try {
          stripeSubscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          console.log(`   Subscription Stripe status: ${stripeSubscription.status}`)
        } catch (err) {
          console.error('❌ [WEBHOOK] Erreur Stripe API:', err)
          throw err
        }

        // 2.3: Déterminer le plan (starter/pro/business + monthly/yearly)
        const priceId = stripeSubscription.items.data[0]?.price.id
        const resolved = priceId ? resolvePlanFromPriceId(priceId) : null
        
        const plan = resolved?.plan || 'starter'
        const billingInterval = resolved?.billingInterval || 'monthly'
        const price = resolved?.price || 19
        const smsLimit = resolved?.smsLimit || 0

        console.log(`   Plan détecté: ${plan} (${billingInterval}) - ${price}€ - SMS: ${smsLimit}/mois`)

        // 2.4: Créer/Mettre à jour la subscription en BDD
        try {
          const createdSubscription = await prisma.subscription.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: 'active',
              plan,
              billingInterval,
              price,
              currency: 'EUR',
              monthlySMSLimit: smsLimit,
              monthlySMSUsed: 0,
              currentPeriodStart: new Date(
                stripeSubscription.current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                stripeSubscription.current_period_end * 1000
              ),
            },
            update: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: 'active',
              plan,
              billingInterval,
              price,
              monthlySMSLimit: smsLimit,
              currentPeriodStart: new Date(
                stripeSubscription.current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                stripeSubscription.current_period_end * 1000
              ),
            },
          })

          console.log(`✅ [WEBHOOK] Subscription créée - ID: ${createdSubscription.id}`)
        } catch (err) {
          console.error('❌ [WEBHOOK] Erreur Prisma - upsert subscription:', err)
          throw err
        }

        break
      }

      // USER ANNULE SON ABONNEMENT (fin de période atteinte → Stripe supprime)
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log(`❌ [WEBHOOK] customer.subscription.deleted`)
        console.log(`   Stripe Customer: ${subscription.customer}`)

        try {
          const updated = await prisma.subscription.updateMany({
            where: { stripeCustomerId: subscription.customer as string },
            data: { status: 'canceled' },
          })

          console.log(`✅ [WEBHOOK] ${updated.count} subscription(s) annulée(s)`)
        } catch (err) {
          console.error('❌ [WEBHOOK] Erreur Prisma - update subscription:', err)
          throw err
        }

        break
      }

      // MISE À JOUR D'ABONNEMENT (cancel_at_period_end, plan change, etc.)
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log(`🔄 [WEBHOOK] customer.subscription.updated`)
        console.log(`   Cancel at period end: ${subscription.cancel_at_period_end}`)

        try {
          const newStatus = subscription.cancel_at_period_end
            ? 'cancel_at_period_end'
            : subscription.status === 'active'
              ? 'active'
              : subscription.status

          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: { status: newStatus },
          })

          console.log(`✅ [WEBHOOK] Subscription mise à jour → ${newStatus}`)
        } catch (err) {
          console.error('❌ [WEBHOOK] Erreur Prisma - update subscription:', err)
          throw err
        }

        break
      }

      // FACTURE PAYÉE (renouvellement)
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        console.log(`💳 [WEBHOOK] invoice.payment_succeeded`)
        console.log(`   Stripe Customer: ${invoice.customer}`)

        if (!invoice.subscription) {
          console.log(`   Pas de subscription, skip`)
          return NextResponse.json({ received: true })
        }

        try {
          const stripeSubscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )

          const updated = await prisma.subscription.updateMany({
            where: { stripeCustomerId: invoice.customer as string },
            data: {
              currentPeriodStart: new Date(
                stripeSubscription.current_period_start * 1000
              ),
              currentPeriodEnd: new Date(
                stripeSubscription.current_period_end * 1000
              ),
              status: 'active',
            },
          })

          console.log(`✅ [WEBHOOK] ${updated.count} subscription(s) mise(s) à jour`)
        } catch (err) {
          console.error('❌ [WEBHOOK] Erreur traitement invoice:', err)
          throw err
        }

        break
      }

      default:
        console.log(`📝 [WEBHOOK] Événement non géré: ${event.type}`)
    }

    // ===================================================================
    // 3. RETOUR SUCCÈS
    // ===================================================================
    console.log(`✅ [WEBHOOK] Événement ${event.id} traité avec succès`)
    return NextResponse.json({ received: true }, { status: 200 })

  } catch (error) {
    // ===================================================================
    // 4. ERREUR CATASTRALE
    // ===================================================================
    console.error(`🔥 [WEBHOOK] Erreur critique:`, error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`   Message: ${errorMsg}`)
    console.error(`   Stack:`, error instanceof Error ? error.stack : 'N/A')

    // Retourner 500 (Stripe va retry)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: errorMsg,
        eventId: event.id,
      },
      { status: 500 }
    )
  }
}