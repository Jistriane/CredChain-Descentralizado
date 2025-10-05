'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Dynamic imports to prevent SSR issues
const Hero = dynamic(() => import('@/components/sections/Hero'), { ssr: false })
const Features = dynamic(() => import('@/components/sections/Features'), { ssr: false })
const HowItWorks = dynamic(() => import('@/components/sections/HowItWorks'), { ssr: false })
const Stats = dynamic(() => import('@/components/sections/Stats'), { ssr: false })
const Testimonials = dynamic(() => import('@/components/sections/Testimonials'), { ssr: false })
const CTA = dynamic(() => import('@/components/sections/CTA'), { ssr: false })
const Footer = dynamic(() => import('@/components/layout/Footer'), { ssr: false })
const Header = dynamic(() => import('@/components/layout/Header'), { ssr: false })

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando CredChain...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <Hero />
      <Features />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
export const dynamic = "force-dynamic"
