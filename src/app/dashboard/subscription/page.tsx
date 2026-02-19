'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Check, Star, CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const planFeatures = [
  "Gestão ilimitada de clientes",
  "Consultas e calendário",
  "Gestão de stocks",
  "Pagamentos Stripe",
  "Relatórios & estatísticas",
  "Suporte por email",
]

export default function SubscriptionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

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

  const handleCheckout = async (priceId: string, planName: string) => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">A Minha Subscrição</h1>
        <p className="text-gray-500 mt-1">Escolha o plano que lhe convém</p>
      </div>

      {success && (
        <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-emerald-800">Pagamento efetuado com sucesso!</p>
            <p className="text-sm text-emerald-700 mt-1">A sua subscrição está ativa. A redirecionar...</p>
          </div>
        </div>
      )}

      {canceled && (
        <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Pagamento cancelado</p>
            <p className="text-sm text-amber-700 mt-1">Pode tentar novamente abaixo.</p>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Plan */}
        <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all hover:shadow-soft-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Mensal</h2>
          <p className="text-sm text-gray-500 mb-6">Perfeito para começar</p>
          <div className="mb-8">
            <span className="text-5xl font-bold text-gray-900">15€</span>
            <span className="text-gray-400 ml-1">/mês s/IVA</span>
          </div>
          <ul className="space-y-3 mb-8">
            {planFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                <Check className="w-4 h-4 text-teal-500 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || '', 'Mensal')}
            disabled={loading}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Subscrever"}
          </Button>
        </div>

        {/* Yearly Plan */}
        <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 p-8 rounded-2xl shadow-teal-lg overflow-hidden">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold border border-white/20">
            -17% de desconto
          </div>
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />

          <h2 className="text-xl font-bold text-white mb-1">Anual</h2>
          <p className="text-sm text-teal-100 mb-6">Melhor oferta</p>
          <div className="mb-8">
            <span className="text-5xl font-bold text-white">150€</span>
            <span className="text-teal-100 ml-1">/ano s/IVA</span>
          </div>
          <ul className="space-y-3 mb-8">
            {planFeatures.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-white/90">
                <Check className="w-4 h-4 text-teal-200 shrink-0" />
                {feature}
              </li>
            ))}
            <li className="flex items-center gap-3 text-sm text-white font-medium">
              <Star className="w-4 h-4 text-yellow-300 shrink-0" />
              Suporte prioritário
            </li>
          </ul>
          <Button
            onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || '', 'Anual')}
            disabled={loading}
            className="w-full bg-white text-teal-700 hover:bg-teal-50 font-semibold shadow-lg"
            size="lg"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Subscrever
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
