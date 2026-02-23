'use client'

import Link from 'next/link'
import { Lock, ArrowRight, Sparkles } from 'lucide-react'
import { usePlan } from '@/lib/use-plan'
import { PLANS } from '@/lib/plans'

interface UpgradePromptProps {
  feature: string
  /** The minimum plan needed to access this feature */
  requiredPlan?: 'pro' | 'business'
}

/**
 * Full-page upgrade prompt shown when a user tries to access a locked feature.
 * Replaces the page content with a clear message and CTA.
 */
export default function UpgradePrompt({
  feature,
  requiredPlan = 'pro',
}: UpgradePromptProps) {
  const { planConfig } = usePlan()
  const targetPlan = PLANS[requiredPlan]

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-6">
          <Lock className="w-7 h-7 text-amber-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Funcionalidade indisponível
        </h1>

        {/* Description */}
        <p className="text-gray-500 mb-6">
          <span className="font-medium text-gray-700">{feature}</span> não está
          incluído no plano{' '}
          <span className="font-medium text-gray-700">{planConfig.name}</span>.
          Atualize para o plano{' '}
          <span className="font-semibold text-teal-600">{targetPlan.name}</span>{' '}
          para desbloquear esta funcionalidade.
        </p>

        {/* Plan comparison */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-teal-500" />
            <p className="text-sm font-semibold text-gray-800">
              Plano {targetPlan.name} inclui:
            </p>
          </div>
          <ul className="space-y-1.5">
            {targetPlan.features.map((f) => (
              <li
                key={f}
                className="text-sm text-gray-600 flex items-start gap-2"
              >
                <span className="text-teal-500 mt-0.5">•</span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard/subscription"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          Ver planos
          <ArrowRight className="w-4 h-4" />
        </Link>

        {/* Current plan info */}
        <p className="text-xs text-gray-400 mt-4">
          Plano atual: {planConfig.name} ({planConfig.monthlyPrice}€/mês)
        </p>
      </div>
    </div>
  )
}
