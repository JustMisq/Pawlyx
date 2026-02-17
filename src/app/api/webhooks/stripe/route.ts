import { NextRequest, NextResponse } from 'next/server'

/**
 * ⚠️ ANCIENNE ROUTE - DÉPRÉCIATED
 * 
 * La route correcte est: /api/stripe/webhook
 * Celle-ci est gardée pour compatibilité seulement.
 * Stripe doit utiliser: https://pawlyx.vercel.app/api/stripe/webhook
 */
export async function POST(request: NextRequest) {
  console.warn('⚠️ Old webhook route used: /api/webhooks/stripe')
  console.warn('   Use: /api/stripe/webhook instead')
  
  // Rediriger Stripe vers la bonne route
  return NextResponse.json(
    {
      error: 'This endpoint is deprecated',
      message: 'Use /api/stripe/webhook instead',
    },
    { status: 410 } // 410 Gone
  )
}

