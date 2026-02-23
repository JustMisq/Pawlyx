'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Store,
  Users,
  PawPrint,
  CalendarDays,
  Scissors,
  Package,
  BarChart3,
  Settings,
  MessageCircle,
  LogOut,
  Menu,
  X,
  Shield,
  UserCog,
  ChevronLeft,
  Lock,
  Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlanProvider, usePlan } from '@/lib/use-plan'
import UpgradePrompt from '@/components/upgrade-prompt'
import { canAccessRoute, type PlanId } from '@/lib/plans'

const mainNavItems = [
  { href: '/dashboard', label: 'Painel', icon: LayoutDashboard, minPlan: 'starter' as PlanId },
  { href: '/dashboard/salon', label: 'O meu salão', icon: Store, minPlan: 'starter' as PlanId },
  { href: '/dashboard/clients', label: 'Clientes', icon: Users, minPlan: 'starter' as PlanId },
  { href: '/dashboard/animals', label: 'Animais', icon: PawPrint, minPlan: 'starter' as PlanId },
  { href: '/dashboard/appointments', label: 'Marcações', icon: CalendarDays, minPlan: 'starter' as PlanId },
  { href: '/dashboard/services', label: 'Serviços', icon: Scissors, minPlan: 'starter' as PlanId },
  { href: '/dashboard/inventory', label: 'Inventário', icon: Package, minPlan: 'pro' as PlanId },
  { href: '/dashboard/messages', label: 'SMS & Mensagens', icon: MessageCircle, minPlan: 'pro' as PlanId },
  { href: '/dashboard/reports', label: 'Relatórios', icon: BarChart3, minPlan: 'pro' as PlanId },
]

const managementNavItems = [
  { href: '/dashboard/staff', label: 'Equipa & Logs', icon: UserCog, minPlan: 'business' as PlanId },
  { href: '/dashboard/settings', label: 'Definições', icon: Settings, minPlan: 'starter' as PlanId },
]

export default function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)
  const hasCheckedRef = useRef(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Vérifier si l'utilisateur a une subscription active (une seule fois)
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && !hasCheckedRef.current) {
      hasCheckedRef.current = true
      
      const checkSubscription = async () => {
        try {
          const res = await fetch('/api/subscription/check')
          if (!res.ok) {
            router.replace('/dashboard/subscription')
            return
          }
          const data = await res.json()
          if (data.hasActiveSubscription) {
            setHasSubscription(true)
          } else {
            router.replace('/dashboard/subscription')
          }
        } catch (error) {
          console.error('Error checking subscription:', error)
          router.replace('/dashboard/subscription')
        }
      }
      
      checkSubscription()
    }
  }, [status, session?.user?.id, router])

  if (status === 'loading' || hasSubscription === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">A carregar...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !hasSubscription) {
    return null
  }

  return (
    <PlanProvider>
      <DashboardShell session={session} pathname={pathname} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} collapsed={collapsed} setCollapsed={setCollapsed}>
        {children}
      </DashboardShell>
    </PlanProvider>
  )
}

function DashboardShell({
  children,
  session,
  pathname,
  sidebarOpen,
  setSidebarOpen,
  collapsed,
  setCollapsed,
}: {
  children: React.ReactNode
  session: any
  pathname: string
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}) {
  const { planId, canAccess, planConfig } = usePlan()

  // Determine the required plan for the upgrade prompt
  const getRequiredPlan = (path: string): 'pro' | 'business' => {
    const businessRoutes = ['/dashboard/staff', '/dashboard/members']
    if (businessRoutes.some((r) => path.startsWith(r))) return 'business'
    return 'pro'
  }

  // Feature name for the upgrade prompt
  const getFeatureName = (path: string): string => {
    const map: Record<string, string> = {
      '/dashboard/inventory': 'Inventário',
      '/dashboard/messages': 'SMS & Mensagens',
      '/dashboard/reports': 'Relatórios',
      '/dashboard/staff': 'Equipa & Logs',
      '/dashboard/members': 'Membros',
    }
    for (const [route, name] of Object.entries(map)) {
      if (path.startsWith(route)) return name
    }
    return 'Esta funcionalidade'
  }

  const routeAllowed = canAccess(pathname)

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  // Check if a nav item is accessible based on plan
  const isNavAccessible = (href: string) => canAccess(href)

  return (
    <div className="flex h-screen bg-gray-50/50">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-100 transition-all duration-300 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 border-b border-gray-100 px-4',
          collapsed ? 'justify-center' : 'justify-between'
        )}>
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-sm group-hover:shadow-teal transition-shadow">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-gray-900 tracking-tight">
                Pawlyx
              </span>
            )}
          </Link>
          
          {/* Collapse button - desktop only */}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          
          {/* Close button - mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="hidden lg:flex mx-auto mt-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {mainNavItems.map((item) => {
            const accessible = isNavAccessible(item.href)
            return (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isActive(item.href)}
                collapsed={collapsed}
                locked={!accessible}
              />
            )
          })}

          <div className="pt-4 mt-4 border-t border-gray-100">
            {!collapsed && (
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Gestão
              </p>
            )}
            {managementNavItems.map((item) => {
              const accessible = isNavAccessible(item.href)
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                  locked={!accessible}
                />
              )
            })}
            {session?.user?.isAdmin && (
              <NavLink
                href="/admin"
                label="Admin Pawlyx"
                icon={Shield}
                active={pathname.startsWith('/admin')}
                collapsed={collapsed}
              />
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-gray-100">
            <NavLink
              href="/dashboard/support"
              label="Suporte"
              icon={MessageCircle}
              active={isActive('/dashboard/support')}
              collapsed={collapsed}
            />
          </div>
        </nav>

        {/* User section */}
        <div className={cn(
          'border-t border-gray-100 p-3',
          collapsed && 'flex flex-col items-center'
        )}>
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {session?.user?.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 uppercase">
                      {planConfig.name}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1 mt-2">
                <Link
                  href="/dashboard/subscription"
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors font-medium"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Plano
                </Link>
                <button
                  onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-white text-xs font-semibold mb-2">
                {userInitials}
              </div>
              <button
                onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Terminar sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between h-14 px-4 bg-white border-b border-gray-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Pawlyx</span>
          </Link>
          <div className="w-9" /> {/* Spacer for centering */}
        </header>

        <main className="flex-1 overflow-auto">
          {routeAllowed ? (
            children
          ) : (
            <UpgradePrompt
              feature={getFeatureName(pathname)}
              requiredPlan={getRequiredPlan(pathname)}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  locked = false,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  active: boolean
  collapsed: boolean
  locked?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-xl transition-all duration-200',
        collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
        locked
          ? 'text-gray-400 hover:bg-gray-50'
          : active
            ? 'bg-teal-50 text-teal-700 font-medium shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      )}
      title={collapsed ? label : undefined}
    >
      <Icon
        className={cn(
          'w-5 h-5 shrink-0',
          locked
            ? 'text-gray-300'
            : active
              ? 'text-teal-600'
              : 'text-gray-400'
        )}
      />
      {!collapsed && (
        <span className="text-sm flex-1">{label}</span>
      )}
      {!collapsed && locked && (
        <Lock className="w-3.5 h-3.5 text-gray-300" />
      )}
    </Link>
  )
}
