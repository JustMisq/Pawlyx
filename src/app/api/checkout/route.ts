import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import Stripe from 'stripe'
import { authConfig } from '@/lib/auth-config'
import { getAllValidPriceIds, resolvePlanFromPriceId } from '@/lib/plans'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

/**
 * POST /api/checkout
 * Crée une session Stripe Checkout pour l'utilisateur connecté
 * Supporte les 3 plans: starter, pro, business (mensal + anual)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('💳 [CHECKOUT] Requête reçue')

    // ===================================================================
    // 1. VÉRIFIER LA SESSION DE L'UTILISATEUR
    // ===================================================================
    
    let session
    try {
      session = await getServerSession(authConfig)
    } catch (err) {
      console.error('❌ [CHECKOUT] Erreur getServerSession:', err)
      return NextResponse.json(
        { error: 'Failed to get session' },
        { status: 500 }
      )
    }

    if (!session?.user?.email) {
      console.warn('⚠️ [CHECKOUT] Utilisateur non authentifié')
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      )
    }

    console.log(`   User: ${session.user.email}`)

    // ===================================================================
    // 2. VALIDER LE PRICE ID
    // ===================================================================
    
    const body = await request.json()
    const { priceId } = body

    if (!priceId) {
      console.warn('⚠️ [CHECKOUT] Price ID manquant')
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Vérifier que le price ID est valide (parmi les 6 possibles)
    const validPriceIds = getAllValidPriceIds()

    if (!validPriceIds.includes(priceId)) {
      console.warn(`⚠️ [CHECKOUT] Invalid price ID: ${priceId}`)
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      )
    }

    const resolved = resolvePlanFromPriceId(priceId)
    if (!resolved) {
      return NextResponse.json(
        { error: 'Could not resolve plan from price ID' },
        { status: 400 }
      )
    }

    console.log(`   Plan: ${resolved.plan} (${resolved.billingInterval}) - ${resolved.price}€`)

    // ===================================================================
    // 3. CRÉER LA SESSION CHECKOUT STRIPE
    // ===================================================================
    
    const nextAuthUrl = process.env.NEXTAUTH_URL
    if (!nextAuthUrl) {
      console.error('❌ [CHECKOUT] NEXTAUTH_URL non configuré')
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      )
    }

    console.log(`   NEXTAUTH_URL: ${nextAuthUrl}`)

    let checkoutSession: Stripe.Checkout.Session
    try {
      checkoutSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: session.user.email,
        allow_promotion_codes: true,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${nextAuthUrl}/dashboard/subscription?success=true`,
        cancel_url: `${nextAuthUrl}/dashboard/subscription?canceled=true`,
        metadata: {
          plan: resolved.plan,
          billingInterval: resolved.billingInterval,
        },
      })

      console.log(`✅ [CHECKOUT] Session créée: ${checkoutSession.id}`)
      console.log(`   URL: ${checkoutSession.url}`)
    } catch (err) {
      console.error('❌ [CHECKOUT] Erreur Stripe API:', err)
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }

    // ===================================================================
    // 4. RETOUR SUCCÈS
    // ===================================================================
    
    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    })

  } catch (error) {
    console.error('🔥 [CHECKOUT] Erreur non-gérée:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

