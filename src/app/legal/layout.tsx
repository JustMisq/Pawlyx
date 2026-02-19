import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PawPrint } from 'lucide-react'

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50/50">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Pawlyx</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Iniciar sessão
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Criar conta</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Conteúdo legal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {children}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-semibold text-gray-900 mb-4">Pawlyx</p>
              <p className="text-sm text-gray-600">Plataforma SaaS para tosquiadores em Portugal</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Legal</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><Link href="/legal/privacy" className="hover:text-primary">Política de privacidade</Link></li>
                <li><Link href="/legal/terms" className="hover:text-primary">Termos de utilização</Link></li>
                <li><Link href="/legal/mentions" className="hover:text-primary">Avisos legais</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Dados</p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li><Link href="/legal/gdpr" className="hover:text-primary">RGPD/LPDP</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-primary">Política de Cookies</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900 mb-4">Contacto</p>
              <p className="text-sm text-gray-600">contact@pawlyx.com</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 text-sm text-gray-600 text-center">
            <p>&copy; 2026 Pawlyx Portugal. Todos os direitos reservados.</p>
            <p className="mt-2">Plataforma em conformidade com a lei portuguesa - LPDP, IVA, Direito do Consumidor</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
