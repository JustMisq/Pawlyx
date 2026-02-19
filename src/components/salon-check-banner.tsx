'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, Store } from 'lucide-react'

export default function SalonCheckBanner() {
  const { data: session } = useSession()
  const [hasSalon, setHasSalon] = useState<boolean | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      checkSalon()
    }
  }, [session?.user?.id])

  const checkSalon = async () => {
    try {
      const res = await fetch('/api/salon')
      setHasSalon(res.ok)
    } catch {
      setHasSalon(false)
    }
  }

  if (hasSalon === null || hasSalon === true) {
    return null
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-amber-900">
            Bem-vindo! Configure o seu salão
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Antes de começar, crie o seu salão de tosquia para aceder a todas as funcionalidades.
          </p>
          <Link
            href="/dashboard/salon"
            className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-amber-700 hover:text-amber-900 transition-colors"
          >
            <Store className="w-4 h-4" />
            Criar o meu salão
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
