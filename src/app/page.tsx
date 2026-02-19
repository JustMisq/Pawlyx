import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Users,
  CalendarDays,
  CreditCard,
  Package,
  Camera,
  Smartphone,
  Check,
  PawPrint,
  ArrowRight,
  Star,
  Sparkles,
  Shield,
  Clock,
  TrendingUp,
} from "lucide-react"

const features = [
  {
    title: "Gestão de clientes",
    description: "Centralize todas as informações dos seus clientes e dos seus animais num só lugar.",
    icon: Users,
    color: "bg-teal-100 text-teal-600",
  },
  {
    title: "Consultas simplificadas",
    description: "Calendário intuitivo com lembretes automáticos para os seus clientes.",
    icon: CalendarDays,
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    title: "Pagamentos seguros",
    description: "Integração Stripe para pagamentos rápidos e seguros.",
    icon: CreditCard,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Gestão de stocks",
    description: "Acompanhe os seus produtos e materiais de tosquia em tempo real.",
    icon: Package,
    color: "bg-amber-100 text-amber-600",
  },
  {
    title: "Portfólio de fotos",
    description: "Destaque as suas melhores tosquias e impressione os seus clientes.",
    icon: Camera,
    color: "bg-pink-100 text-pink-600",
  },
  {
    title: "Acesso móvel",
    description: "Gira o seu salão a partir do telemóvel, onde quer que esteja.",
    icon: Smartphone,
    color: "bg-violet-100 text-violet-600",
  },
]

const benefits = [
  { icon: Clock, text: "Poupe 5h por semana" },
  { icon: TrendingUp, text: "+30% de clientes fidelizados" },
  { icon: Shield, text: "Dados 100% seguros" },
]

const planFeatures = [
  "Gestão ilimitada de clientes",
  "Consultas e calendário",
  "Gestão de stocks",
  "Pagamentos Stripe",
  "Relatórios e estatísticas",
  "Suporte por email",
]

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-sm group-hover:shadow-teal transition-all">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Pawlyx</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-4 py-2"
            >
              Iniciar sessão
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="shadow-teal">
                Começar gratuitamente
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-teal-100/60 via-cyan-50/40 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-teal-50/50 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium mb-6 border border-teal-100">
              <Sparkles className="w-4 h-4" />
              A plataforma #1 dos tosquiadores
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              Gira o seu salão de
              <span className="text-gradient"> tosquia</span>
              {" "}simplesmente
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              A Pawlyx ajuda-o a gerir os seus clientes, animais, consultas e pagamentos num só lugar.
              Comece gratuitamente, sem cartão bancário.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/auth/register">
                <Button size="xl" variant="brand">
                  Começar agora
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                Descobrir as funcionalidades
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Benefits pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.text}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <benefit.icon className="w-4 h-4 text-teal-500" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual - Dashboard preview mockup */}
          <div className="relative mt-16 mx-auto max-w-4xl">
            <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-2xl p-1 shadow-2xl">
              <div className="bg-gray-900 rounded-xl p-2">
                {/* Fake browser bar */}
                <div className="flex items-center gap-2 px-3 py-2 mb-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-md px-4 py-1 text-xs text-gray-400 text-center">
                    app.pawlyx.com/dashboard
                  </div>
                </div>
                {/* Dashboard preview placeholder */}
                <div className="bg-gray-50 rounded-lg aspect-[16/9] flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-teal">
                      <PawPrint className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-400 text-sm">O seu dashboard Pawlyx</p>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 via-cyan-500/10 to-teal-500/20 rounded-3xl blur-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-3">
              Funcionalidades
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Tudo o que precisa
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Ferramentas poderosas e simples para gerir o seu salão no dia a dia.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 bg-white rounded-2xl border border-gray-100 hover:border-teal-200 hover:shadow-soft-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wider mb-3">
              Preços
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simples e transparente
            </h2>
            <p className="text-lg text-gray-500">
              Um só plano, todas as funcionalidades. Escolha o seu ritmo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Monthly Plan */}
            <div className="relative bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all hover:shadow-soft-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Mensal</h3>
              <p className="text-sm text-gray-500 mb-6">Perfeito para começar</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-gray-900">18,45€</span>
                <span className="text-gray-400 ml-1">/mês com IVA</span>
                <p className="text-xs text-gray-400 mt-1">15€ sem IVA + 23% IVA</p>
              </div>
              <ul className="space-y-3 mb-8">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-teal-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register?plan=monthly" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  Começar
                </Button>
              </Link>
            </div>

            {/* Yearly Plan */}
            <div className="relative bg-gradient-to-br from-teal-500 to-teal-600 p-8 rounded-2xl shadow-teal-lg overflow-hidden">
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold border border-white/20">
                -17% de desconto
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />

              <h3 className="text-xl font-bold text-white mb-1">Anual</h3>
              <p className="text-sm text-teal-100 mb-6">Melhor oferta</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">184,50€</span>
                <span className="text-teal-100 ml-1">/ano com IVA</span>
                <p className="text-xs text-teal-200 mt-1">150€ sem IVA + 23% IVA</p>
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
              <Link href="/auth/register?plan=yearly" className="block">
                <Button
                  className="w-full bg-white text-teal-700 hover:bg-teal-50 font-semibold shadow-lg"
                  size="lg"
                >
                  Começar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl p-10 sm:p-16 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Pronto para simplificar o seu salão?
              </h2>
              <p className="text-teal-100 text-lg mb-8 max-w-xl mx-auto">
                Junte-se aos tosquiadores que confiam na Pawlyx para gerir a sua atividade no dia a dia.
              </p>
              <Link href="/auth/register">
                <Button
                  size="xl"
                  className="bg-white text-teal-700 hover:bg-teal-50 shadow-lg font-semibold"
                >
                  Criar a minha conta gratuitamente
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* À propos */}
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  <PawPrint className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold">Pawlyx</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                A plataforma tudo-em-um para tosquiadores profissionais em Portugal.
              </p>
            </div>

            {/* Produit */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">
                Produto
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/#features" className="hover:text-white transition-colors">
                    Funcionalidades
                  </Link>
                </li>
                <li>
                  <Link href="/#pricing" className="hover:text-white transition-colors">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-white transition-colors">
                    Criar uma conta
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-white transition-colors">
                    Iniciar sessão
                  </Link>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">
                Legal
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="/legal/mentions" className="hover:text-white transition-colors">
                    Avisos legais
                  </Link>
                </li>
                <li>
                  <Link href="/legal/privacy" className="hover:text-white transition-colors">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="hover:text-white transition-colors">
                    Termos
                  </Link>
                </li>
                <li>
                  <Link href="/legal/gdpr" className="hover:text-white transition-colors">
                    RGPD / LPDP
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-300">
                Contacto
              </h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href="mailto:contact@pawlyx.com" className="hover:text-white transition-colors">
                    contact@pawlyx.com
                  </a>
                </li>
                <li>
                  <a href="mailto:support@pawlyx.com" className="hover:text-white transition-colors">
                    support@pawlyx.com
                  </a>
                </li>
                <li>
                  <a href="mailto:dpo@pawlyx.com" className="hover:text-white transition-colors">
                    dpo@pawlyx.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 Pawlyx. Todos os direitos reservados.
            </p>
            <p className="text-gray-600 text-xs">
              Conforme LPDP • IVA • RGPD • Código do Consumidor
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
