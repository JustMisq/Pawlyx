/**
 * Subscription Plans Configuration
 * Centralized config for Starter / Pro / Business tiers
 */

export type PlanId = 'starter' | 'pro' | 'business'

export interface PlanConfig {
  id: PlanId
  name: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  monthlySMSLimit: number
  features: string[]
  /**
   * Routes the user can access (matched with startsWith).
   * '/dashboard' = the main dashboard page only.
   */
  allowedRoutes: string[]
  /** Features that are explicitly locked for this plan (shown as upgrade prompts) */
  lockedFeatures: string[]
  /** Whether advanced stats are shown on the dashboard */
  advancedStats: boolean
  /** Whether the user can access team/staff management */
  staffManagement: boolean
  /** Whether the user can send SMS */
  smsAccess: boolean
  /** Whether the user can access inventory */
  inventoryAccess: boolean
  /** Whether the user can access reports */
  reportsAccess: boolean
}

export const PLANS: Record<PlanId, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'O essencial para começar',
    monthlyPrice: 19,
    yearlyPrice: 190, // ~2 meses grátis
    monthlySMSLimit: 0,
    features: [
      'Gestão de clientes',
      'Gestão de animais',
      'Marcações e calendário',
      'Gestão de serviços',
      'O meu salão',
      'Definições',
      'Suporte por email',
    ],
    allowedRoutes: [
      '/dashboard',
      '/dashboard/salon',
      '/dashboard/clients',
      '/dashboard/animals',
      '/dashboard/appointments',
      '/dashboard/services',
      '/dashboard/settings',
      '/dashboard/support',
    ],
    lockedFeatures: [
      'SMS & Mensagens',
      'Inventário',
      'Relatórios & Estatísticas',
      'Equipa & Logs',
      'Estatísticas avançadas',
    ],
    advancedStats: false,
    staffManagement: false,
    smsAccess: false,
    inventoryAccess: false,
    reportsAccess: false,
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'Para profissionais que querem crescer',
    monthlyPrice: 39,
    yearlyPrice: 390, // ~2 meses grátis
    monthlySMSLimit: 150,
    features: [
      'Tudo do Starter',
      'Estatísticas avançadas',
      'Inventário & Stocks',
      'SMS & Mensagens (150/mês)*',
      'Relatórios completos',
      'Suporte prioritário',
    ],
    allowedRoutes: [
      '/dashboard',
      '/dashboard/salon',
      '/dashboard/clients',
      '/dashboard/animals',
      '/dashboard/appointments',
      '/dashboard/services',
      '/dashboard/inventory',
      '/dashboard/messages',
      '/dashboard/reports',
      '/dashboard/settings',
      '/dashboard/support',
    ],
    lockedFeatures: ['Equipa & Logs'],
    advancedStats: true,
    staffManagement: false,
    smsAccess: true,
    inventoryAccess: true,
    reportsAccess: true,
  },

  business: {
    id: 'business',
    name: 'Business',
    description: 'Acesso completo para equipas',
    monthlyPrice: 59,
    yearlyPrice: 590, // ~2 meses grátis
    monthlySMSLimit: 500,
    features: [
      'Tudo do Pro',
      'SMS & Mensagens (500/mês)*',
      'Equipa & Logs',
      'Gestão de membros',
      'Acesso completo',
      'Suporte dedicado',
    ],
    allowedRoutes: [
      '/dashboard',
      '/dashboard/salon',
      '/dashboard/clients',
      '/dashboard/animals',
      '/dashboard/appointments',
      '/dashboard/services',
      '/dashboard/inventory',
      '/dashboard/messages',
      '/dashboard/reports',
      '/dashboard/staff',
      '/dashboard/members',
      '/dashboard/settings',
      '/dashboard/support',
    ],
    lockedFeatures: [],
    advancedStats: true,
    staffManagement: true,
    smsAccess: true,
    inventoryAccess: true,
    reportsAccess: true,
  },
}

/**
 * Get the plan config for a plan ID, defaults to starter
 */
export function getPlanConfig(planId: string | null | undefined): PlanConfig {
  if (planId && planId in PLANS) {
    return PLANS[planId as PlanId]
  }
  return PLANS.starter
}

/**
 * Check if a route is accessible for a given plan
 */
export function canAccessRoute(planId: string | null | undefined, pathname: string): boolean {
  const plan = getPlanConfig(planId)
  
  // Exact match for /dashboard
  if (pathname === '/dashboard') return true
  
  // Check if any allowed route matches
  return plan.allowedRoutes.some((route) => {
    if (route === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(route)
  })
}

/**
 * Get the Stripe price env var names for a plan
 */
export function getStripePriceEnvVars(planId: PlanId): {
  monthly: string
  yearly: string
} {
  return {
    monthly: `STRIPE_PRICE_ID_${planId.toUpperCase()}_MONTHLY`,
    yearly: `STRIPE_PRICE_ID_${planId.toUpperCase()}_YEARLY`,
  }
}

/**
 * Map a Stripe Price ID to a plan + billing interval
 */
export function resolvePlanFromPriceId(priceId: string): {
  plan: PlanId
  billingInterval: 'monthly' | 'yearly'
  price: number
  smsLimit: number
} | null {
  const planIds: PlanId[] = ['starter', 'pro', 'business']

  for (const planId of planIds) {
    const plan = PLANS[planId]
    const envVars = getStripePriceEnvVars(planId)
    const monthlyPriceId = process.env[envVars.monthly]
    const yearlyPriceId = process.env[envVars.yearly]

    if (priceId === monthlyPriceId) {
      return {
        plan: planId,
        billingInterval: 'monthly',
        price: plan.monthlyPrice,
        smsLimit: plan.monthlySMSLimit,
      }
    }
    if (priceId === yearlyPriceId) {
      return {
        plan: planId,
        billingInterval: 'yearly',
        price: plan.yearlyPrice,
        smsLimit: plan.monthlySMSLimit,
      }
    }
  }

  return null
}

/**
 * Get all valid Stripe price IDs from env vars
 */
export function getAllValidPriceIds(): string[] {
  const planIds: PlanId[] = ['starter', 'pro', 'business']
  const ids: string[] = []

  for (const planId of planIds) {
    const envVars = getStripePriceEnvVars(planId)
    const monthly = process.env[envVars.monthly]
    const yearly = process.env[envVars.yearly]
    if (monthly) ids.push(monthly)
    if (yearly) ids.push(yearly)
  }

  return ids
}
