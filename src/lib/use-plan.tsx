'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getPlanConfig, canAccessRoute, type PlanConfig, type PlanId } from '@/lib/plans'

interface SubscriptionState {
  plan: PlanId
  billingInterval: 'monthly' | 'yearly'
  status: string
  currentPeriodEnd: string
}

interface PlanContextValue {
  /** Current plan config */
  planConfig: PlanConfig
  /** Raw subscription data */
  subscription: SubscriptionState | null
  /** Whether the plan data is loading */
  loading: boolean
  /** Check if a route is accessible */
  canAccess: (pathname: string) => boolean
  /** Current plan ID */
  planId: PlanId
  /** Refresh plan data */
  refresh: () => Promise<void>
}

const PlanContext = createContext<PlanContextValue>({
  planConfig: getPlanConfig('starter'),
  subscription: null,
  loading: true,
  canAccess: () => true,
  planId: 'starter',
  refresh: async () => {},
})

export function PlanProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchPlan = async () => {
    try {
      const res = await fetch('/api/subscription/check')
      if (res.ok) {
        const data = await res.json()
        if (data.hasActiveSubscription && data.subscription) {
          setSubscription({
            plan: data.subscription.plan || 'starter',
            billingInterval: data.subscription.billingInterval || 'monthly',
            status: data.subscription.status,
            currentPeriodEnd: data.subscription.currentPeriodEnd,
          })
        }
      }
    } catch (error) {
      console.error('Error fetching plan:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlan()
  }, [])

  const planId = subscription?.plan || 'starter'
  const planConfig = getPlanConfig(planId)

  const value: PlanContextValue = {
    planConfig,
    subscription,
    loading,
    canAccess: (pathname: string) => canAccessRoute(planId, pathname),
    planId,
    refresh: fetchPlan,
  }

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>
}

export function usePlan() {
  return useContext(PlanContext)
}
