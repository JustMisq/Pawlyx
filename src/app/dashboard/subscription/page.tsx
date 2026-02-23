'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, CheckCircle2, AlertTriangle, ArrowRight, Loader2, Star, Zap, Crown, XCircle, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { PLANS, type PlanId } from '@/lib/plans'

const PLAN_ORDER: PlanId[] = ['starter', 'pro', 'business']

const PLAN_STYLES: Record<PlanId, {
  icon: typeof Star
  gradient: string
  badge?: string
  badgeClass: string
  buttonClass: string
  featureCheck: string
}> = {
  starter: {
    icon: Star,
    gradient: '',
    badgeClass: '',
    buttonClass: 'bg-gray-900 hover:bg-gray-800 text-white',
    featureCheck: 'text-gray-400',
  },
  pro: {
    icon: Zap,
    gradient: 'bg-gradient-to-br from-teal-500 to-teal-600',
    badge: 'Popular',
    badgeClass: 'bg-white/20 text-white border-white/20',
    buttonClass: 'bg-white text-teal-700 hover:bg-teal-50 shadow-lg',
    featureCheck: 'text-teal-200',
  },
  business: {
    icon: Crown,
    gradient: '',
    badgeClass: '',
    buttonClass: 'bg-gray-900 hover:bg-gray-800 text-white',
    featureCheck: 'text-gray-400',
  },
}

export default function SubscriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [reactivating, setReactivating] = useState(false)

  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [success, router])

  const fetchSubscription = () => {
    fetch('/api/subscription/check')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasActiveSubscription && data.subscription) {
          setCurrentPlan(data.subscription.plan)
          setSubscriptionStatus(data.subscription.status)
          setPeriodEnd(data.subscription.currentPeriodEnd)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  const handleCancel = async () => {
    if (!confirm('Tem a certeza que pretende cancelar a sua subscrição? O acesso será mantido até ao final do período atual.')) return

    setCancelling(true)
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success('Subscrição cancelada. O acesso mantém-se até ao final do período.')
        fetchSubscription()
      } else {
        toast.error(data.error || 'Erro ao cancelar')
      }
    } catch {
      toast.error('Erro ao cancelar')
    } finally {
      setCancelling(false)
    }
  }

  const handleReactivate = async () => {
    setReactivating(true)
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Subscrição reativada com sucesso!')
        fetchSubscription()
      } else {
        toast.error(data.error || 'Erro ao reativar')
      }
    } catch {
      toast.error('Erro ao reativar')
    } finally {
      setReactivating(false)
    }
  }

  const handleCheckout = async (planId: PlanId) => {
    const envKey = billingInterval === 'monthly'
      ? `NEXT_PUBLIC_STRIPE_PRICE_ID_${planId.toUpperCase()}_MONTHLY`
      : `NEXT_PUBLIC_STRIPE_PRICE_ID_${planId.toUpperCase()}_YEARLY`

    const priceId = (
      {
        NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_MONTHLY,
        NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY,
        NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_MONTHLY,
        NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY,
        NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_MONTHLY,
        NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BUSINESS_YEARLY,
      } as Record<string, string | undefined>
    )[envKey]

    if (!priceId) {
      toast.error('Preço não configurado. Contacte o suporte.')
      return
    }

    setLoading(planId)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      if (!res.ok) {
        toast.error('Erro ao criar o pagamento')
        return
      }

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Ocorreu um erro')
    } finally {
      setLoading(null)
    }
  }

  const getPrice = (planId: PlanId) => {
    const plan = PLANS[planId]
    return billingInterval === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
  }

  const getSavings = (planId: PlanId) => {
    const plan = PLANS[planId]
    const monthlyCost = plan.monthlyPrice * 12
    const yearlyCost = plan.yearlyPrice
    return monthlyCost - yearlyCost
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Escolha o plano ideal para o seu salão
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">
          Todos os planos incluem acesso imediato. Sem compromisso, cancele quando quiser.
        </p>

        {/* Billing Toggle */}
        <div className="mt-6 inline-flex items-center bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              billingInterval === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBillingInterval('yearly')}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              billingInterval === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Anual
            <span className="ml-1.5 text-xs text-teal-600 font-semibold">-2 meses</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 max-w-2xl mx-auto">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-emerald-800">Pagamento efetuado com sucesso!</p>
            <p className="text-sm text-emerald-700 mt-1">A sua subscrição está ativa. A redirecionar...</p>
          </div>
        </div>
      )}

      {canceled && (
        <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 max-w-2xl mx-auto">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Pagamento cancelado</p>
            <p className="text-sm text-amber-700 mt-1">Pode tentar novamente abaixo.</p>
          </div>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId]
          const style = PLAN_STYLES[planId]
          const Icon = style.icon
          const isHighlighted = planId === 'pro'
          const isCurrent = currentPlan === planId
          const price = getPrice(planId)
          const savings = getSavings(planId)

          return (
            <div
              key={planId}
              className={`relative rounded-2xl overflow-hidden transition-all ${
                isHighlighted
                  ? `${style.gradient} p-8 shadow-xl shadow-teal-500/20 ring-2 ring-teal-400`
                  : 'bg-white p-8 border-2 border-gray-100 hover:border-gray-200 hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {style.badge && (
                <div
                  className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold border ${style.badgeClass}`}
                >
                  {style.badge}
                </div>
              )}

              {isCurrent && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                  Plano atual
                </div>
              )}

              {/* Decorative elements for highlighted plan */}
              {isHighlighted && (
                <>
                  <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl" />
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                </>
              )}

              {/* Plan Header */}
              <div className="mb-6 relative">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    isHighlighted
                      ? 'bg-white/20'
                      : 'bg-gray-100'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isHighlighted ? 'text-white' : 'text-gray-600'
                    }`}
                  />
                </div>
                <h2
                  className={`text-xl font-bold mb-1 ${
                    isHighlighted ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {plan.name}
                </h2>
                <p
                  className={`text-sm ${
                    isHighlighted ? 'text-teal-100' : 'text-gray-500'
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6 relative">
                <span
                  className={`text-4xl font-bold ${
                    isHighlighted ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {billingInterval === 'monthly'
                    ? `${price}€`
                    : `${Math.round(price / 12)}€`}
                </span>
                <span
                  className={`ml-1 ${
                    isHighlighted ? 'text-teal-100' : 'text-gray-400'
                  }`}
                >
                  /mês
                </span>
                {billingInterval === 'yearly' && (
                  <p
                    className={`text-sm mt-1 ${
                      isHighlighted ? 'text-teal-100' : 'text-gray-500'
                    }`}
                  >
                    {price}€/ano · Poupa {savings}€
                  </p>
                )}
                <p
                  className={`text-xs mt-0.5 ${
                    isHighlighted ? 'text-teal-200/80' : 'text-gray-400'
                  }`}
                >
                  s/IVA
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 relative">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={`flex items-center gap-3 text-sm ${
                      isHighlighted ? 'text-white/90' : 'text-gray-600'
                    }`}
                  >
                    <Check
                      className={`w-4 h-4 shrink-0 ${style.featureCheck}`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handleCheckout(planId)}
                disabled={loading !== null || isCurrent}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 relative ${
                  isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : style.buttonClass
                } disabled:opacity-60`}
              >
                {loading === planId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isCurrent ? (
                  'Plano atual'
                ) : (
                  <>
                    Subscrever
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Bottom note */}
      <p className="text-center text-xs text-gray-400 mt-8 max-w-lg mx-auto">
        Todos os preços são apresentados sem IVA. O pagamento é processado de forma
        segura via Stripe. Pode cancelar ou alterar o seu plano a qualquer momento.
      </p>
      <p className="text-center text-xs text-gray-400 mt-2 max-w-lg mx-auto">
        * Após atingir o limite mensal de SMS, cada SMS adicional é faturado a 0,008€ (0,8 cêntimos).
      </p>

      {/* Gestion de l'abonnement actif */}
      {currentPlan && (
        <div className="mt-12 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Gerir subscrição</h3>
            
            {subscriptionStatus === 'cancel_at_period_end' ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Cancelamento agendado</p>
                    <p className="text-sm text-amber-700 mt-1">
                      A sua subscrição será cancelada no final do período atual
                      {periodEnd && (
                        <> — <strong>{new Date(periodEnd).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></>
                      )}. Até lá, mantém o acesso completo ao seu plano.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReactivate}
                  disabled={reactivating}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-60"
                >
                  {reactivating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                  Reativar subscrição
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Plano atual: <strong className="text-gray-700 capitalize">{currentPlan}</strong>
                  {periodEnd && (
                    <> · Próxima faturação: <strong className="text-gray-700">{new Date(periodEnd).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></>
                  )}
                </p>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-xl hover:bg-red-50 transition-all disabled:opacity-60"
                >
                  {cancelling ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Cancelar subscrição
                </button>
                <p className="text-xs text-gray-400">
                  Ao cancelar, mantém o acesso até ao final do período de faturação atual.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
