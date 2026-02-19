import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14b8a6",
}

export const metadata: Metadata = {
  title: "Pawlyx - Gestão de Salão de Tosquia",
  description: "A plataforma tudo-em-um para gerir o seu salão de tosquia: clientes, animais, consultas e pagamentos.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Pawlyx - Gestão de Salão de Tosquia",
    description: "A plataforma tudo-em-um para gerir o seu salão de tosquia.",
    type: "website",
    locale: "pt_PT",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
