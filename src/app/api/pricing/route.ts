import { NextRequest, NextResponse } from 'next/server'
import { PLANS } from '@/lib/plans'

export async function GET() {
  try {
    return NextResponse.json({
      plans: {
        starter: {
          name: PLANS.starter.name,
          monthlyPrice: PLANS.starter.monthlyPrice,
          yearlyPrice: PLANS.starter.yearlyPrice,
          currency: 'EUR',
          features: PLANS.starter.features,
          smsLimit: PLANS.starter.monthlySMSLimit,
        },
        pro: {
          name: PLANS.pro.name,
          monthlyPrice: PLANS.pro.monthlyPrice,
          yearlyPrice: PLANS.pro.yearlyPrice,
          currency: 'EUR',
          features: PLANS.pro.features,
          smsLimit: PLANS.pro.monthlySMSLimit,
        },
        business: {
          name: PLANS.business.name,
          monthlyPrice: PLANS.business.monthlyPrice,
          yearlyPrice: PLANS.business.yearlyPrice,
          currency: 'EUR',
          features: PLANS.business.features,
          smsLimit: PLANS.business.monthlySMSLimit,
        },
      },
    })
  } catch (error) {
    console.error('Get pricing error:', error)
    return NextResponse.json(
      { message: 'Error fetching pricing' },
      { status: 500 }
    )
  }
}
