import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { logger, getErrorMessage } from '@/lib/logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    logger.error('STRIPE/WEBHOOK', 'STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    logger.error('STRIPE/WEBHOOK', 'No stripe-signature header found')
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    logger.info('STRIPE/WEBHOOK', `Event verified: ${event.type}`)
  } catch (error) {
    logger.error('STRIPE/WEBHOOK', 'Signature verification failed', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        logger.info('STRIPE/WEBHOOK', 'checkout.session.completed received', {
          customer_email: session.customer_email,
          subscription: session.subscription,
          customer: session.customer,
        })

        if (!session.customer_email) {
          logger.error('STRIPE/WEBHOOK', 'Missing customer_email in session')
          return NextResponse.json(
            { error: 'Missing customer_email' },
            { status: 400 }
          )
        }

        if (!session.subscription) {
          logger.error('STRIPE/WEBHOOK', 'Missing subscription in session')
          return NextResponse.json(
            { error: 'Missing subscription' },
            { status: 400 }
          )
        }

        const user = await prisma.user.findUnique({
          where: { email: session.customer_email },
        })

        if (!user) {
          logger.error('STRIPE/WEBHOOK', `User not found for email: ${session.customer_email}`)
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          )
        }

        try {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          const priceId = subscription.items.data[0]?.price.id
          const plan =
            priceId === process.env.STRIPE_PRICE_ID_MONTHLY
              ? 'monthly'
              : 'yearly'
          
          const price = plan === 'monthly' ? 15 : 150

          logger.info('STRIPE/WEBHOOK', 'Creating subscription', {
            userId: user.id,
            plan,
            stripeSubscriptionId: session.subscription,
          })

          await prisma.subscription.upsert({
            where: { userId: user.id },
            create: {
              userId: user.id,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: 'active',
              plan,
              price,
              currency: 'EUR',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              status: 'active',
              plan,
              price,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          })

          logger.audit('STRIPE/WEBHOOK', 'SUBSCRIPTION_CREATED', user.id, { plan })
        } catch (substriptionError) {
          logger.error('STRIPE/WEBHOOK', 'Failed to create subscription', substriptionError)
          return NextResponse.json(
            { error: 'Failed to create subscription' },
            { status: 500 }
          )
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        logger.info('STRIPE/WEBHOOK', 'customer.subscription.deleted received', {
          stripeCustomerId: subscription.customer,
        })

        const subscriptionRecord = await prisma.subscription.findFirst({
          where: { stripeCustomerId: subscription.customer as string },
        })

        if (!subscriptionRecord) {
          logger.warn('STRIPE/WEBHOOK', `Subscription not found for customer: ${subscription.customer}`)
          return NextResponse.json({ received: true }, { status: 200 })
        }

        await prisma.subscription.update({
          where: { id: subscriptionRecord.id },
          data: { status: 'canceled' },
        })

        logger.audit('STRIPE/WEBHOOK', 'SUBSCRIPTION_CANCELED', subscriptionRecord.userId)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        logger.info('STRIPE/WEBHOOK', 'invoice.payment_succeeded received', {
          stripeCustomerId: invoice.customer,
          subscription: invoice.subscription,
        })

        if (!invoice.subscription) {
          logger.debug('STRIPE/WEBHOOK', 'Invoice without subscription, skipping')
          return NextResponse.json({ received: true }, { status: 200 })
        }

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        )

        const subscriptionRecord = await prisma.subscription.findFirst({
          where: { stripeCustomerId: invoice.customer as string },
        })

        if (!subscriptionRecord) {
          logger.warn('STRIPE/WEBHOOK', `Subscription not found for customer: ${invoice.customer}`)
          return NextResponse.json({ received: true }, { status: 200 })
        }

        await prisma.subscription.update({
          where: { id: subscriptionRecord.id },
          data: {
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        })

        logger.audit('STRIPE/WEBHOOK', 'INVOICE_PAID', subscriptionRecord.userId)
        break
      }

      default:
        logger.debug('STRIPE/WEBHOOK', `Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('STRIPE/WEBHOOK', 'Webhook processing failed', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
